export type BudgetCategoryOption = {
    key: string
    name: string
}

export const BUDGET_CATEGORY_OPTIONS: BudgetCategoryOption[] = [
    { key: 'food', name: 'Food' },
    { key: 'transportation', name: 'Transportation' },
    { key: 'housingUtilities', name: 'Housing and Utilities' },
    { key: 'shopping', name: 'Shopping' },
    { key: 'healthPersonalCare', name: 'Health and Personal Care' },
    { key: 'entertainment', name: 'Entertainment' },
    { key: 'travel', name: 'Travel' },
    { key: 'debtPayments', name: 'Debt Payments' },
    { key: 'insuranceFinancialServices', name: 'Insurance and Financial Services' },
    { key: 'educationChildcare', name: 'Education and Childcare' },
    { key: 'givingTaxes', name: 'Giving and Taxes' },
    { key: 'fees', name: 'Fees' },
    { key: 'savingsGoals', name: 'Savings Goals' },
    { key: 'income', name: 'Income' },
    { key: 'transfers', name: 'Transfers' },
    { key: 'uncategorized', name: 'Uncategorized' },
]

export const DEFAULT_BUDGET_CATEGORY = 'Uncategorized'

export const SPENDING_BUDGET_CATEGORY_OPTIONS = BUDGET_CATEGORY_OPTIONS.filter(
    (option) => !['income', 'transfers', 'uncategorized'].includes(option.key),
)