const express = require("express");
const cors = require('cors');
const app = express();
const { createLink, exchangeLink } = require("./link-handler/linkController.js");
const { getAccounts } = require("./accounts/accountsController.js");
const { createBudget } = require("./budgets/budgetsController.js");

const APP_PORT = process.env.APP_PORT || 8000;

app.use(cors());
app.use(express.json());

app.post('/create-link', createLink);
app.post('/exchange-token', exchangeLink);

app.get('/accounts', getAccounts);
app.post('/budgets', createBudget);

app.listen(APP_PORT, () => {
  console.log(`Server is listening on Port ${APP_PORT}`);
})