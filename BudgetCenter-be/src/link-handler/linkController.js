require('dotenv').config();
const { client, PLAID_PRODUCTS, PLAID_COUNTRY_CODES } = require('../plaid.client');
const prisma = require('../../db.js');
const { ensureDefaultUser } = require('../users/defaultUser');

async function createLink(req, res) {
    try {
        const user = await ensureDefaultUser();
        const response = await client.linkTokenCreate({
            user: { client_user_id: String(user.id) },
            client_name: 'BudgetCenter',
            products: PLAID_PRODUCTS, // Specify required products
            country_codes: PLAID_COUNTRY_CODES,
            language: 'en',
        });

        res.json({ link_token: response.data.link_token });

    } catch (error) {
        res.status(500).json({
            error: "Failed to handle create-link request",
            details: error.message,
        });
    }
}

async function exchangeLink(req, res) {
    const publicToken = req.body.public_token;

    if (!publicToken) {
        return res.status(400).json({
            error: 'Missing public_token',
        });
    }

    try {
        const currentUser = await ensureDefaultUser();
        const tokenResponse = await client.itemPublicTokenExchange({
            public_token: publicToken,
        });

        const accessToken = tokenResponse.data.access_token;
        const itemId = tokenResponse.data.item_id;
        const itemResponse = await client.itemGet({
            access_token: accessToken,
        });
        const institutionId = itemResponse.data.item.institution_id;
        const user = await prisma.user.findUnique({
            where: { id: currentUser.id },
            select: {
                id: true,
                plaidItems: {
                    where: { institutionId },
                    select: { id: true },
                },
            },
        });

        if (user.plaidItems.length > 0) {
            return res.status(409).json({
                error: 'This institution is already linked for the user',
            });
        }

        const linkedItem = await prisma.plaidItem.create({
            data: {
                userId: user.id,
                accessToken,
                itemId,
                institutionId: itemResponse.data.item.institution_id,
            },
            select: {
                id: true,
                itemId: true,
            },
        });

        return res.json({
            message: 'Access token stored.',
            item: linkedItem,
        });

    } catch (error) {
        return res.status(500).json({
            error: 'Failed to exchange public token',
            details: error.message,
        });
    }
}

module.exports = {
    createLink, exchangeLink
};
