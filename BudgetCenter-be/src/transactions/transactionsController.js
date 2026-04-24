require('dotenv').config();
const prisma = require('../../db.js');
const { client } = require('../plaid.client');
const { ensureDefaultUser } = require('../users/defaultUser');
const { mapTransactionToBudgetCategory } = require('./budgetCategoryMap');

function getLast90DaysRange() {
	const endDate = new Date();
	const startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
	return {
		startDate: startDate.toISOString().slice(0, 10),
		endDate: endDate.toISOString().slice(0, 10),
	};
}

async function getSyncedTransactions(accessToken) {
	let cursor = null;
	let hasMore = true;
	const added = [];
	const modified = [];
	const removed = [];

	try {
		while (hasMore) {
			const response = await client.transactionsSync({
				access_token: accessToken,
				cursor,
				count: 500,
			});

			added.push(...response.data.added);
			modified.push(...response.data.modified);
			removed.push(...response.data.removed);
			hasMore = response.data.has_more;
			cursor = response.data.next_cursor;
		}
	}
	catch (error) {
		if (error?.response?.data?.error_code === 'PRODUCT_NOT_READY') {
			return [];
		}

		throw error;
	}

	const removedIds = new Set(removed.map((transaction) => transaction.transaction_id));
	const mergedById = new Map();

	for (const transaction of added) {
		if (!removedIds.has(transaction.transaction_id)) {
			mergedById.set(transaction.transaction_id, transaction);
		}
	}

	for (const transaction of modified) {
		if (!removedIds.has(transaction.transaction_id)) {
			mergedById.set(transaction.transaction_id, transaction);
		}
	}

	return Array.from(mergedById.values());
}

async function getTransactions(req, res) {
	try {
		const currentUser = await ensureDefaultUser();
		const range = getLast90DaysRange();

		const user = await prisma.user.findUnique({
			where: { id: currentUser.id },
			select: {
				plaidItems: {
					select: {
						id: true,
						itemId: true,
						accessToken: true,
						institutionName: true,
					},
				},
			},
		});

		if (!user || user.plaidItems.length === 0) {
			return res.json([]);
		}

		const transactionResponses = await Promise.all(
			user.plaidItems.map(async (plaidItem) => {
				const syncedTransactions = await getSyncedTransactions(plaidItem.accessToken);

				return syncedTransactions
					.filter((transaction) => {
						const transactionDate = transaction.authorized_date || transaction.date;
						return transactionDate && transactionDate >= range.startDate && transactionDate <= range.endDate;
					})
					.map((transaction) => {
					const category = mapTransactionToBudgetCategory(transaction);

					return {
						...transaction,
						budgetCenterItemId: plaidItem.id,
						plaidItemId: plaidItem.itemId,
						institutionName: plaidItem.institutionName,
						budgetCategoryKey: category.budgetCategoryKey,
						budgetCategoryName: category.budgetCategoryName,
						isSpending: category.isSpending,
					};
					});
			}),
		);

		const transactions = transactionResponses
			.flat()
			.sort((a, b) => {
				const aDate = Date.parse(a.date || a.authorized_date || '');
				const bDate = Date.parse(b.date || b.authorized_date || '');
				return bDate - aDate;
			});

		return res.json(transactions);
	}
	catch (error) {
		console.error(error);
		return res.status(500).json({
			error: 'Failed to get transactions',
			details: error.message,
		});
	}
}

module.exports = {
	getTransactions,
};
