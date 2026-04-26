const express = require("express");
const cors = require('cors');
const app = express();
const { createLink, exchangeLink } = require("./link-handler/linkController.js");
const { getAccounts } = require("./accounts/accountsController.js");
const { createBudget, getBudgets } = require("./budgets/budgetsController.js");
const { getTransactions } = require("./transactions/transactionsController.js");
const {
  createOrUpdateSavingsGoal,
  ingestSavingsSnapshotForMonth,
  getSavingsMonthlySummaryHandler,
  getSavingsTrendHandler,
} = require('./savingsGoals/savingsGoalsController.js');

const APP_PORT = process.env.APP_PORT || 8000;

app.use(cors());
app.use(express.json());

app.post('/create-link', createLink);
app.post('/exchange-token', exchangeLink);

app.get('/accounts', getAccounts);
app.get('/transactions', getTransactions);
app.post('/create-budget', createBudget);
app.get('/budgets', getBudgets);
app.post('/savings-goals', createOrUpdateSavingsGoal);
app.post('/savings-snapshots/ingest', ingestSavingsSnapshotForMonth);
app.get('/savings-summary', getSavingsMonthlySummaryHandler);
app.get('/savings-trend', getSavingsTrendHandler);

app.listen(APP_PORT, () => {
  console.log(`Server is listening on Port ${APP_PORT}`);
})