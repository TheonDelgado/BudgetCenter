require('dotenv').config();
const { client, PLAID_PRODUCTS, PLAID_COUNTRY_CODES } = require('../plaid.client');

let ACCESS_TOKEN = null;
let USER_TOKEN = null;
let USER_ID = null;
let PUBLIC_TOKEN = null;
let ITEM_ID = null;
let ACCOUNT_ID = null;

async function createLink(req, res) {
    try {
        const response = await client.linkTokenCreate({
            user: { client_user_id: 'user1' }, // Must be unique to the user
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
        const tokenResponse = await client.itemPublicTokenExchange({
            public_token: publicToken,
        });

        // These values should be saved to a persistent database and
        // associated with the currently signed-in user
        const accessToken = tokenResponse.data.access_token;
        const itemID = tokenResponse.data.item_id;

        res.json({
            accessToken : accessToken,
            itemID : itemID
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to exchange public token',
            details: error.message,
        });
    }
}

module.exports = {
    createLink, exchangeLink
};
