require('dotenv').config();
const prisma = require('../../db.js');
const { Prisma } = require('@prisma/client');
const { ensureDefaultUser } = require('../users/defaultUser');
const { BUDGET_CATEGORY_OPTIONS } = require('../transactions/budgetCategoryMap');

const ALLOWED_BUDGET_CATEGORIES = new Set(
    BUDGET_CATEGORY_OPTIONS
        .filter((option) => !['income', 'transfers', 'uncategorized'].includes(option.key))
        .map((option) => option.name),
);

async function createBudget(req, res) {
    try {
        const { name, category, amount, type, month } = req.body ?? {};

        if (!name || !category || !amount || !type || !month) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'name, category, amount, type, and month are required.',
            });
        }

        const normalizedName = String(name).trim();
        const normalizedCategory = String(category).trim();
        const normalizedMonth = String(month).trim();
        const normalizedAmount = String(amount).trim();
        const normalizedType = String(type).trim();
        const numericAmount = Number(normalizedAmount);

        if (!normalizedName) {
            return res.status(400).json({
                error: 'Invalid name',
                details: 'name cannot be empty.',
            });
        }

        if (!normalizedCategory) {
            return res.status(400).json({
                error: 'Invalid category',
                details: 'category cannot be empty.',
            });
        }

        if (!ALLOWED_BUDGET_CATEGORIES.has(normalizedCategory)) {
            return res.status(400).json({
                error: 'Invalid category',
                details: `category must be one of: ${Array.from(ALLOWED_BUDGET_CATEGORIES).join(', ')}`,
            });
        }

        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({
                error: 'Invalid amount',
                details: 'amount must be a positive number.',
            });
        }

        const roundedAmount = numericAmount.toFixed(2);
        const decimalAmount = new Prisma.Decimal(roundedAmount);

        if (!normalizedMonth) {
            return res.status(400).json({
                error: 'Invalid month',
                details: 'month cannot be empty.',
            });
        }

        if (!normalizedType) {
            return res.status(400).json({
                error: 'Invalid type',
                details: 'type cannot be empty.',
            });
        }

        if (!['Monthly', 'Misc'].includes(normalizedType)) {
            return res.status(400).json({
                error: 'Invalid type',
                details: 'type must be either "Monthly" or "Misc".',
            });
        }

        const currentUser = await ensureDefaultUser();
        const budget = await prisma.budget.create({
            data: {
                userId: currentUser.id,
                name: normalizedName,
                category: normalizedCategory,
                amount: decimalAmount,
                type: normalizedType,
                month: normalizedMonth,
                createdAt: new Date(),
            },
            select: {
                id: true,
                userId: true,
                name: true,
                category: true,
                amount: true,
                type: true,
                month: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return res.json(budget);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            error: 'Failed to create budget',
            details: error.message,
        });
    }
}

async function getBudgets(req, res) {
    try {
        const currentUser = await ensureDefaultUser();
        const budgets = await prisma.budget.findMany({
            where: {
                userId: currentUser.id,
            },
            select: {
                id: true,
                userId: true,
                name: true,
                category: true,
                amount: true,
                type: true,
                month: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const normalizedBudgets = budgets.map((budget) => ({
            ...budget,
            category: budget.category || 'Uncategorized',
        }));

        return res.json(normalizedBudgets);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            error: 'Failed to fetch budgets',
            details: error.message,
        });
    }
}

module.exports = {
    createBudget,
    getBudgets,
};