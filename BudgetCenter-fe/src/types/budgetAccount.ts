export type BudgetAccount = {
    account_id: string
    name: string
    official_name?: string | null
    institutionName?: string | null
    type: string
    subtype?: string | null
    balances?: {
        current?: number | null
        available?: number | null
        iso_currency_code?: string | null
        unofficial_currency_code?: string | null
    }
    budgetCenterItemId?: number
    plaidItemId?: string | null
}