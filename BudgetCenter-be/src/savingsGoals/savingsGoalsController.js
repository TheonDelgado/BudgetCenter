const prisma = require('../../db.js');
const { Prisma } = require('@prisma/client');
const { client } = require('../plaid.client');
const { ensureDefaultUser } = require('../users/defaultUser');

function isValidMonthLabel(value) {
    const match = /^(January|February|March|April|May|June|July|August|September|October|November|December)\s(\d{4})$/.exec(value);

    if (!match) {
        return false;
    }

    const year = Number(match[2]);

    return Number.isInteger(year) && year > 0;
}

function isSavingsAccount(account) {
    return String(account?.subtype ?? '').toLowerCase() === 'savings';
}

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

function formatMonthLabel(date) {
    return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

function toNumber(value) {
    return Number(value ?? 0);
}

function clampPercent(value) {
    if (!Number.isFinite(value)) {
        return 0;
    }

    return Math.max(0, Math.round(value));
}

async function ingestSavingsSnapshot(monthKey) {
    const normalizedMonthKey = String(monthKey ?? '').trim();

    if (!isValidMonthLabel(normalizedMonthKey)) {
        throw new Error('monthKey must use the "Month YYYY" format, for example "August 2025".');
    }

    const currentUser = await ensureDefaultUser();
    const user = await prisma.user.findUnique({
        where: { id: currentUser.id },
        select: {
            plaidItems: {
                select: {
                    accessToken: true,
                    itemId: true,
                    institutionName: true,
                },
            },
        },
    });

    if (!user || user.plaidItems.length === 0) {
        return [];
    }

    const accountResponses = await Promise.all(
        user.plaidItems.map(async (plaidItem) => {
            const response = await client.accountsGet({
                access_token: plaidItem.accessToken,
            });

            return response.data.accounts.map((account) => ({
                ...account,
                plaidItemId: plaidItem.itemId,
                institutionName: plaidItem.institutionName,
            }));
        }),
    );

    const capturedAt = new Date();
    const savingsAccounts = accountResponses
        .flat()
        .filter(isSavingsAccount)
        .filter((account) => Number.isFinite(account?.balances?.current));

    const snapshots = await Promise.all(
        savingsAccounts.map((account) => {
            const roundedBalance = Number(account.balances.current).toFixed(2);
            const decimalBalance = new Prisma.Decimal(roundedBalance);

            return prisma.savingsSnapshot.upsert({
                where: {
                    userId_monthKey_accountId: {
                        userId: currentUser.id,
                        monthKey: normalizedMonthKey,
                        accountId: account.account_id,
                    },
                },
                update: {
                    balance: decimalBalance,
                    capturedAt,
                },
                create: {
                    userId: currentUser.id,
                    monthKey: normalizedMonthKey,
                    accountId: account.account_id,
                    balance: decimalBalance,
                    capturedAt,
                    createdAt: capturedAt,
                },
                select: {
                    id: true,
                    userId: true,
                    monthKey: true,
                    accountId: true,
                    balance: true,
                    capturedAt: true,
                    createdAt: true,
                },
            });
        }),
    );

    return snapshots;
}

async function getSavingsMonthlySummary(monthKey) {
    const normalizedMonthKey = String(monthKey ?? '').trim();

    if (!isValidMonthLabel(normalizedMonthKey)) {
        throw new Error('monthKey must use the "Month YYYY" format, for example "August 2025".');
    }

    const currentUser = await ensureDefaultUser();

    const [goal, snapshotAggregate] = await Promise.all([
        prisma.savingsGoal.findUnique({
            where: {
                userId_monthKey: {
                    userId: currentUser.id,
                    monthKey: normalizedMonthKey,
                },
            },
            select: {
                amount: true,
            },
        }),
        prisma.savingsSnapshot.aggregate({
            where: {
                userId: currentUser.id,
                monthKey: normalizedMonthKey,
            },
            _sum: {
                balance: true,
            },
            _max: {
                capturedAt: true,
            },
        }),
    ]);

    const targetAmount = toNumber(goal?.amount);
    const savedAmount = toNumber(snapshotAggregate?._sum?.balance);
    const percent = targetAmount > 0 ? clampPercent((savedAmount / targetAmount) * 100) : 0;
    const remainingDelta = targetAmount - savedAmount;

    return {
        monthKey: normalizedMonthKey,
        targetAmount,
        savedAmount,
        percent,
        remainingDelta,
        lastCapturedAt: snapshotAggregate?._max?.capturedAt ?? null,
    };
}

async function getSavingsTrend(lastNMonths) {
    const numericLastNMonths = Number(lastNMonths);
    if (!Number.isInteger(numericLastNMonths) || numericLastNMonths <= 0) {
        throw new Error('lastNMonths must be a positive integer.');
    }

    const currentUser = await ensureDefaultUser();
    const months = Array.from({ length: numericLastNMonths }, (_, index) => {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - (numericLastNMonths - 1 - index));
        return formatMonthLabel(d);
    });

    const [goals, snapshots] = await Promise.all([
        prisma.savingsGoal.findMany({
            where: {
                userId: currentUser.id,
                monthKey: {
                    in: months,
                },
            },
            select: {
                monthKey: true,
                amount: true,
            },
        }),
        prisma.savingsSnapshot.findMany({
            where: {
                userId: currentUser.id,
                monthKey: {
                    in: months,
                },
            },
            select: {
                monthKey: true,
                balance: true,
            },
        }),
    ]);

    const goalByMonth = new Map(goals.map((goal) => [goal.monthKey, toNumber(goal.amount)]));
    const savedByMonth = snapshots.reduce((acc, snapshot) => {
        const existing = acc.get(snapshot.monthKey) ?? 0;
        acc.set(snapshot.monthKey, existing + toNumber(snapshot.balance));
        return acc;
    }, new Map());

    return months.map((monthKey) => {
        const targetAmount = goalByMonth.get(monthKey) ?? 0;
        const savedAmount = savedByMonth.get(monthKey) ?? 0;
        const percent = targetAmount > 0 ? clampPercent((savedAmount / targetAmount) * 100) : 0;

        return {
            monthKey,
            targetAmount,
            savedAmount,
            percent,
        };
    });
}

async function createOrUpdateSavingsGoal(req, res) {
    try {
        const { amount, month } = req.body ?? {};

        if (!amount || !month) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'amount and month are required.',
            });
        }

        const normalizedAmount = String(amount).trim();
        const normalizedMonth = String(month).trim();
        const numericAmount = Number(normalizedAmount);

        if (!amount) {
            return res.status(400).json({
                error: 'Invalid amount',
                details: 'amount cannot be empty.',
            });
        }

        if (!month) {
            return res.status(400).json({
                error: 'Invalid month',
                details: 'month cannot be empty.',
            });
        }

        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({
                error: 'Invalid amount',
                details: 'amount must be a positive number.',
            });
        }

        if (!isValidMonthLabel(normalizedMonth)) {
            return res.status(400).json({
                error: 'Invalid month',
                details: 'month must use the "Month YYYY" format, for example "August 2025".',
            });
        }

        const roundedAmount = numericAmount.toFixed(2);
        const decimalAmount = new Prisma.Decimal(roundedAmount);

        const currentUser = await ensureDefaultUser();
        const now = new Date();
        const savingsGoal = await prisma.savingsGoal.upsert({
            where: {
                userId_monthKey: {
                    userId: currentUser.id,
                    monthKey: normalizedMonth,
                },
            },
            update: {
                amount: decimalAmount,
            },
            create: {
                userId: currentUser.id,
                amount: decimalAmount,
                monthKey: normalizedMonth,
                createdAt: now,
            },
            select: {
                id: true,
                userId: true,
                amount: true,
                monthKey: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return res.json({
            id: savingsGoal.id,
            userId: savingsGoal.userId,
            monthKey: savingsGoal.monthKey,
            targetAmount: toNumber(savingsGoal.amount),
            createdAt: savingsGoal.createdAt,
            updatedAt: savingsGoal.updatedAt,
        });
    }
    catch (error) {
        return res.status(500).json({
            error: 'Failed to create or update savings goal',
            details: error.message,
        });
    }
}

async function ingestSavingsSnapshotForMonth(req, res) {
    try {
        const monthKey = String(req.query.monthKey ?? req.body?.monthKey ?? '').trim();

        if (!monthKey) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'monthKey is required.',
            });
        }

        const snapshots = await ingestSavingsSnapshot(monthKey);

        return res.json({
            monthKey,
            snapshotsIngested: snapshots.length,
            snapshots,
        });
    }
    catch (error) {
        return res.status(500).json({
            error: 'Failed to ingest savings snapshot',
            details: error.message,
        });
    }
}

async function getSavingsMonthlySummaryHandler(req, res) {
    try {
        const monthKey = String(req.query.monthKey ?? '').trim();

        if (!monthKey) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'monthKey is required.',
            });
        }

        const summary = await getSavingsMonthlySummary(monthKey);
        return res.json(summary);
    }
    catch (error) {
        return res.status(500).json({
            error: 'Failed to fetch savings monthly summary',
            details: error.message,
        });
    }
}

async function getSavingsTrendHandler(req, res) {
    try {
        const months = Number(req.query.months ?? 6);
        const trend = await getSavingsTrend(months);
        return res.json(trend);
    }
    catch (error) {
        return res.status(500).json({
            error: 'Failed to fetch savings trend',
            details: error.message,
        });
    }
}

module.exports = {
    createOrUpdateSavingsGoal,
    ingestSavingsSnapshot,
    getSavingsMonthlySummary,
    getSavingsTrend,
    ingestSavingsSnapshotForMonth,
    getSavingsMonthlySummaryHandler,
    getSavingsTrendHandler,
};