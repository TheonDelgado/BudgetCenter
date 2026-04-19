require('dotenv').config();
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';
const PLAID_PRODUCTS = (process.env.PLAID_PRODUCTS).split(
    ',',
);
const PLAID_COUNTRY_CODES = (process.env.PLAID_COUNTRY_CODES || 'US').split(
    ',',
);
const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI || '';

let ACCESS_TOKEN = null;
let USER_TOKEN = null;
let USER_ID = null;
let PUBLIC_TOKEN = null;
let ITEM_ID = null;
let ACCOUNT_ID = null;

const configuration = new Configuration({
    basePath: PlaidEnvironments[PLAID_ENV],
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
            'PLAID-SECRET': PLAID_SECRET,
        },
    },
});

const client = new PlaidApi(configuration);

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
