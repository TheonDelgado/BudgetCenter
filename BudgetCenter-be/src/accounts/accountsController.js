require('dotenv').config();
const prisma = require('../../db.js');
const { client } = require('../plaid.client');
const { ensureDefaultUser } = require('../users/defaultUser');

async function getAccounts(req, res) {
    try {
        const currentUser = await ensureDefaultUser();
        const user = await prisma.user.findUnique({
            where: { id: currentUser.id },
            select: {
                plaidItems: {
                    select: {
                        id: true,
                        accessToken: true,
                        itemId: true,
                    },
                },
            },
        });

        if (user.plaidItems.length === 0) {
            return res.status(404).json({
                error: 'No linked institutions found for user',
            });
        }

        const accountResponses = await Promise.all(
            user.plaidItems.map(async (plaidItem) => {
                const response = await client.accountsGet({
                    access_token: plaidItem.accessToken,
                });

                return response.data.accounts.map((account) => ({
                    ...account,
                    budgetCenterItemId: plaidItem.id,
                    plaidItemId: plaidItem.itemId,
                }));
            }),
        );
        const accounts = accountResponses.flat();

        return res.json(accounts);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'Failed to get accounts',
            details: error.message,
        });
    }
}

module.exports = {
    getAccounts
}