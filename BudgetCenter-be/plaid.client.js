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

module.exports = {
    PLAID_PRODUCTS,
    PLAID_COUNTRY_CODES,
    client
};