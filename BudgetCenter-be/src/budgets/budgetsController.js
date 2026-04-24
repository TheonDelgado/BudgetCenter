require('dotenv').config();
const prisma = require('../../db.js');
const { Prisma } = require('@prisma/client');
const { ensureDefaultUser } = require('../users/defaultUser');

async function createBudget(req, res) {
    try {
        const { name, amount, type, periodStart, periodEnd } = req.body ?? {};

        if (!name || !amount || !type || !periodStart || !periodEnd) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'name, amount, type, periodStart, and periodEnd are required.',
            });
        }

        const normalizedName = String(name).trim();
        const normalizedStart = String(periodStart).trim();
        const normalizedEnd = String(periodEnd).trim();
        const normalizedAmount = String(amount).trim();
        const normalizedType = String(type).trim();
        const numericAmount = Number(normalizedAmount);

        if (!normalizedName) {
            return res.status(400).json({
                error: 'Invalid name',
                details: 'name cannot be empty.',
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

        if (!normalizedStart) {
            return res.status(400).json({
                error: 'Invalid periodStart',
                details: 'periodStart cannot be empty.',
            });
        }

        if (!normalizedEnd) {
            return res.status(400).json({
                error: 'Invalid periodEnd',
                details: 'periodEnd cannot be empty.',
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
                amount: decimalAmount,
                type: normalizedType,
                periodStart: normalizedStart,
                periodEnd: normalizedEnd,
                createdAt: new Date(),
            },
            select: {
                id: true,
                userId: true,
                name: true,
                amount: true,
                type: true,
                periodStart: true,
                periodEnd: true,
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
                amount: true,
                type: true,
                periodStart: true,
                periodEnd: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return res.json(budgets);
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