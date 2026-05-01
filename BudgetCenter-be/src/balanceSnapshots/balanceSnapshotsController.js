const prisma = require('../../db.js');
const { Prisma } = require('@prisma/client');
const { client } = require('../plaid.client');
const { ensureDefaultUser } = require('../users/defaultUser');

const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

function isValidMonthLabel(value) {
    const match = /^(January|February|March|April|May|June|July|August|September|October|November|December)\s(\d{4})$/.exec(value);

    if (!match) {
        return false;
    }

    const year = Number(match[2]);
    return Number.isInteger(year) && year > 0;
}

function formatMonthLabel(date) {
    return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

function parseMonthLabel(monthKey) {
    const match = /^(January|February|March|April|May|June|July|August|September|October|November|December)\s(\d{4})$/.exec(monthKey);
    if (!match) {
        return null;
    }

    const monthIndex = MONTH_NAMES.indexOf(match[1]);
    const year = Number(match[2]);
    if (monthIndex < 0 || !Number.isInteger(year) || year <= 0) {
        return null;
    }

    return { monthIndex, year };
}

function toNumber(value) {
    return Number(value ?? 0);
}

function getPreviousMonthLabel(monthKey) {
    const parsed = parseMonthLabel(monthKey);
    if (!parsed) {
        return null;
    }

    const previousMonthDate = new Date(parsed.year, parsed.monthIndex, 1);
    previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
    return formatMonthLabel(previousMonthDate);
}

async function ingestBalanceSnapshot(monthKeyInput) {
    const now = new Date();
    const currentMonthKey = formatMonthLabel(now);
    const normalizedMonthKey = String(monthKeyInput ?? currentMonthKey).trim() || currentMonthKey;

    if (!isValidMonthLabel(normalizedMonthKey)) {
        throw new Error('monthKey must use the "Month YYYY" format, for example "August 2025".');
    }

    // Prevent creating snapshots for historical/future months and non-month-start dates.
    if (normalizedMonthKey !== currentMonthKey) {
        return {
            monthKey: normalizedMonthKey,
            snapshotCaptured: false,
            reason: 'Snapshots can only be captured for the current month.',
        };
    }

    if (now.getDate() !== 1) {
        return {
            monthKey: normalizedMonthKey,
            snapshotCaptured: false,
            reason: 'Snapshots are only captured on the 1st day of the month.',
        };
    }

    const currentUser = await ensureDefaultUser();
    const user = await prisma.user.findUnique({
        where: { id: currentUser.id },
        select: {
            plaidItems: {
                select: {
                    accessToken: true,
                },
            },
        },
    });

    if (!user || user.plaidItems.length === 0) {
        return {
            monthKey: normalizedMonthKey,
            snapshotCaptured: false,
            reason: 'No linked accounts found.',
        };
    }

    const accountResponses = await Promise.all(
        user.plaidItems.map(async (plaidItem) => {
            const response = await client.accountsGet({
                access_token: plaidItem.accessToken,
            });

            return response.data.accounts;
        }),
    );

    const totalBalance = accountResponses
        .flat()
        .reduce((sum, account) => {
            const currentBalance = Number(account?.balances?.current);
            return Number.isFinite(currentBalance) ? sum + currentBalance : sum;
        }, 0);

    const roundedBalance = Number(totalBalance).toFixed(2);
    const decimalBalance = new Prisma.Decimal(roundedBalance);

    const capturedAt = new Date();
    const snapshot = await prisma.balanceSnapshot.upsert({
        where: {
            userId_monthKey: {
                userId: currentUser.id,
                monthKey: normalizedMonthKey,
            },
        },
        update: {
            totalBalance: decimalBalance,
            capturedAt,
        },
        create: {
            userId: currentUser.id,
            monthKey: normalizedMonthKey,
            totalBalance: decimalBalance,
            capturedAt,
            createdAt: capturedAt,
        },
        select: {
            id: true,
            userId: true,
            monthKey: true,
            totalBalance: true,
            capturedAt: true,
            createdAt: true,
        },
    });

    return {
        monthKey: normalizedMonthKey,
        snapshotCaptured: true,
        snapshot: {
            ...snapshot,
            totalBalance: toNumber(snapshot.totalBalance),
        },
    };
}

async function getBalanceMonthlySummary(monthKeyInput) {
    const fallbackMonthKey = formatMonthLabel(new Date());
    const monthKey = String(monthKeyInput ?? fallbackMonthKey).trim() || fallbackMonthKey;

    if (!isValidMonthLabel(monthKey)) {
        throw new Error('monthKey must use the "Month YYYY" format, for example "August 2025".');
    }

    const previousMonthKey = getPreviousMonthLabel(monthKey);
    const currentUser = await ensureDefaultUser();

    const [currentSnapshot, previousSnapshot] = await Promise.all([
        prisma.balanceSnapshot.findUnique({
            where: {
                userId_monthKey: {
                    userId: currentUser.id,
                    monthKey,
                },
            },
            select: {
                totalBalance: true,
                capturedAt: true,
            },
        }),
        previousMonthKey
            ? prisma.balanceSnapshot.findUnique({
                where: {
                    userId_monthKey: {
                        userId: currentUser.id,
                        monthKey: previousMonthKey,
                    },
                },
                select: {
                    totalBalance: true,
                    capturedAt: true,
                },
            })
            : Promise.resolve(null),
    ]);

    const currentBalance = toNumber(currentSnapshot?.totalBalance);
    const previousBalance = toNumber(previousSnapshot?.totalBalance);
    const changeAmount = currentBalance - previousBalance;
    const percentChange = previousBalance !== 0
        ? (changeAmount / Math.abs(previousBalance)) * 100
        : 0;

    return {
        monthKey,
        previousMonthKey,
        currentBalance,
        previousBalance,
        changeAmount,
        percentChange,
        hasCurrentSnapshot: Boolean(currentSnapshot),
        hasPreviousSnapshot: Boolean(previousSnapshot),
        lastCapturedAt: currentSnapshot?.capturedAt ?? null,
    };
}

async function ingestBalanceSnapshotForMonth(req, res) {
    try {
        const monthKey = String(req.query.monthKey ?? req.body?.monthKey ?? '').trim() || undefined;
        const result = await ingestBalanceSnapshot(monthKey);
        return res.json(result);
    }
    catch (error) {
        return res.status(500).json({
            error: 'Failed to ingest balance snapshot',
            details: error.message,
        });
    }
}

async function getBalanceMonthlySummaryHandler(req, res) {
    try {
        const monthKey = String(req.query.monthKey ?? '').trim() || undefined;
        const summary = await getBalanceMonthlySummary(monthKey);
        return res.json(summary);
    }
    catch (error) {
        return res.status(500).json({
            error: 'Failed to fetch balance monthly summary',
            details: error.message,
        });
    }
}

module.exports = {
    ingestBalanceSnapshotForMonth,
    getBalanceMonthlySummaryHandler,
};
