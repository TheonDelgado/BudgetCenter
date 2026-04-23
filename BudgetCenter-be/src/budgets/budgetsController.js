require('dotenv').config();
const prisma = require('../../db.js');
const { ensureDefaultUser } = require('../users/defaultUser');

async function createBudget(req, res) {
    try {
        const { name, amount, periodStart, periodEnd } = req.body ?? {};

        if (!name || !amount || !periodStart || !periodEnd) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'name, amount, periodStart, and periodEnd are required.',
            });
        }

        const normalizedName = String(name).trim();
        const normalizedStart = String(periodStart).trim();
        const normalizedEnd = String(periodEnd).trim();
        const numericAmount = Number(amount);

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

        const startDate = new Date(normalizedStart);
        const endDate = new Date(normalizedEnd);

        if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
            return res.status(400).json({
                error: 'Invalid period',
                details: 'periodStart and periodEnd must be valid date strings.',
            });
        }

        if (startDate > endDate) {
            return res.status(400).json({
                error: 'Invalid period range',
                details: 'periodStart must be less than or equal to periodEnd.',
            });
        }

        const currentUser = await ensureDefaultUser();
        const budget = await prisma.budget.create({
            data: {
                userId: currentUser.id,
                name: normalizedName,
                amount: numericAmount.toString(),
                periodStart: normalizedStart,
                periodEnd: normalizedEnd,
                createdAt: new Date(),
            },
            select: {
                id: true,
                userId: true,
                name: true,
                amount: true,
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

module.exports = {
    createBudget,
};