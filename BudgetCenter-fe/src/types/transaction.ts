export type Transaction = {
    transaction_id: string
    account_id: string
    amount: number
    date: string
    authorized_date?: string | null
    name?: string | null
    merchant_name?: string | null
    pending?: boolean
    iso_currency_code?: string | null
    unofficial_currency_code?: string | null
    category?: string[] | null
    personal_finance_category?: {
        primary?: string
        detailed?: string
        confidence_level?: string | null
    } | null
    budgetCenterItemId?: number
    plaidItemId?: string | null
    institutionName?: string | null
    budgetCategoryKey?: string
    budgetCategoryName?: string
    isSpending?: boolean
}
