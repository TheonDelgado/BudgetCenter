require('dotenv').config;
const { client } = require('../plaid.client');

async function getAccounts(req, res) {
    const request = {
        accessToken: "fetus"
    }
    try {
        const response = await client.accountsGet(request);
        const accounts = response.data.accounts;

        res.json(accounts);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            error: 'Failed to get accounts',
            details: error.message,
        });
    }
}

module.exports = {
    getAccounts
}