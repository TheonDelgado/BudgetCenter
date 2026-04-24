const BUDGET_CATEGORY_OPTIONS = [
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
];

const PRIMARY_TO_BUDGET_KEY = {
    FOOD_AND_DRINK: 'food',
    TRANSPORTATION: 'transportation',
    RENT_AND_UTILITIES: 'housingUtilities',
    HOME_IMPROVEMENT: 'housingUtilities',
    GENERAL_MERCHANDISE: 'shopping',
    MEDICAL: 'healthPersonalCare',
    PERSONAL_CARE: 'healthPersonalCare',
    ENTERTAINMENT: 'entertainment',
    TRAVEL: 'travel',
    LOAN_PAYMENTS: 'debtPayments',
    BANK_FEES: 'fees',
    INCOME: 'income',
    TRANSFER_IN: 'transfers',
    TRANSFER_OUT: 'transfers',
    GOVERNMENT_AND_NON_PROFIT: 'givingTaxes',
    GENERAL_SERVICES: 'uncategorized',
};

const DETAILED_TO_BUDGET_KEY = {
    GENERAL_SERVICES_INSURANCE: 'insuranceFinancialServices',
    GENERAL_SERVICES_ACCOUNTING_AND_FINANCIAL_PLANNING: 'insuranceFinancialServices',
    GENERAL_SERVICES_EDUCATION: 'educationChildcare',
    GENERAL_SERVICES_CHILDCARE: 'educationChildcare',
    TRANSFER_OUT_SAVINGS: 'savingsGoals',
    TRANSFER_OUT_INVESTMENT_AND_RETIREMENT_FUNDS: 'savingsGoals',
};

const NON_SPENDING_KEYS = new Set(['income', 'transfers']);

const LEGACY_CATEGORY_TO_KEY = {
    FOOD_AND_DRINK: 'food',
    TRANSPORTATION: 'transportation',
    TRAVEL: 'travel',
    RECREATION: 'entertainment',
    SHOPS: 'shopping',
    SERVICE: 'uncategorized',
    PAYMENT: 'transfers',
    BANK_FEES: 'fees',
    INTEREST: 'income',
    RENT: 'housingUtilities',
    UTILITIES: 'housingUtilities',
    HOME_IMPROVEMENT: 'housingUtilities',
    MEDICAL: 'healthPersonalCare',
};

const MERCHANT_KEYWORD_MAP = [
    { pattern: /\b(uber|lyft|shell|chevron|exxon|bp|metro|transit|taxi|parking|toll)\b/i, key: 'transportation' },
    { pattern: /\b(starbucks|mcdonald|chipotle|restaurant|cafe|coffee|doordash|ubereats|grocery|market|whole\s*foods)\b/i, key: 'food' },
    { pattern: /\b(united\s*airlines|delta|southwest|hotel|airbnb|booking\.com|expedia|flight)\b/i, key: 'travel' },
    { pattern: /\b(netflix|spotify|hulu|amc|cinema|steam|xbox|playstation|casino)\b/i, key: 'entertainment' },
    { pattern: /\b(amazon|target|walmart|costco|best\s*buy|ebay|etsy)\b/i, key: 'shopping' },
    { pattern: /\b(payment|pymnt|autopay|credit\s*card\s*payment|transfer)\b/i, key: 'transfers' },
    { pattern: /\b(interest|intrst)\b/i, key: 'income' },
];

function getPrimaryFromDetailed(detailed) {
    if (!detailed) {
        return null;
    }

    const normalizedDetailed = String(detailed).trim().toUpperCase();

    const sortedPrimaryCandidates = Object.keys(PRIMARY_TO_BUDGET_KEY)
        .sort((a, b) => b.length - a.length);

    for (const candidate of sortedPrimaryCandidates) {
        if (normalizedDetailed === candidate || normalizedDetailed.startsWith(`${candidate}_`)) {
            return candidate;
        }
    }

    return null;
}

function getOptionNameByKey(key) {
    return BUDGET_CATEGORY_OPTIONS.find((option) => option.key === key)?.name ?? 'Uncategorized';
}

function normalizeLegacyCategory(value) {
    return String(value)
        .trim()
        .replace(/&/g, 'AND')
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .toUpperCase();
}

function getKeyFromLegacyCategory(transaction) {
    const categories = Array.isArray(transaction?.category) ? transaction.category : [];

    for (const rawCategory of categories) {
        const normalizedCategory = normalizeLegacyCategory(rawCategory);

        if (LEGACY_CATEGORY_TO_KEY[normalizedCategory]) {
            return LEGACY_CATEGORY_TO_KEY[normalizedCategory];
        }

        for (const candidate of Object.keys(LEGACY_CATEGORY_TO_KEY)) {
            if (normalizedCategory.startsWith(`${candidate}_`)) {
                return LEGACY_CATEGORY_TO_KEY[candidate];
            }
        }
    }

    return null;
}

function getKeyFromMerchantDescription(transaction) {
    const text = [transaction?.merchant_name, transaction?.name]
        .filter(Boolean)
        .join(' ')
        .trim();

    if (!text) {
        return null;
    }

    for (const matcher of MERCHANT_KEYWORD_MAP) {
        if (matcher.pattern.test(text)) {
            return matcher.key;
        }
    }

    return null;
}

function mapTransactionToBudgetCategory(transaction) {
    const detailed = transaction?.personal_finance_category?.detailed
        ? String(transaction.personal_finance_category.detailed).trim().toUpperCase()
        : null;

    const primary = transaction?.personal_finance_category?.primary
        ? String(transaction.personal_finance_category.primary).trim().toUpperCase()
        : getPrimaryFromDetailed(detailed);

    const legacyKey = getKeyFromLegacyCategory(transaction);
    const merchantFallbackKey = getKeyFromMerchantDescription(transaction);

    const key = DETAILED_TO_BUDGET_KEY[detailed]
        || PRIMARY_TO_BUDGET_KEY[primary]
        || legacyKey
        || merchantFallbackKey
        || 'uncategorized';

    return {
        budgetCategoryKey: key,
        budgetCategoryName: getOptionNameByKey(key),
        isSpending: !NON_SPENDING_KEYS.has(key),
    };
}

module.exports = {
    BUDGET_CATEGORY_OPTIONS,
    mapTransactionToBudgetCategory,
};