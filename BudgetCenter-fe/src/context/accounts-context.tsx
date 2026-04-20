'use client'

import {
    useCallback,
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'
import { getAccounts } from '../app/services/accounts.service'

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

type AccountsContextValue = {
    accounts: BudgetAccount[]
    isLoading: boolean
    error: string | null
    refreshAccounts: () => Promise<BudgetAccount[]>
    clearAccountsError: () => void
}

const AccountsContext = createContext<AccountsContextValue | undefined>(undefined)

export function AccountsProvider({ children }: { children: ReactNode }) {
    const [accounts, setAccounts] = useState<BudgetAccount[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const refreshAccounts = useCallback(async () => {
        setIsLoading(true)

        try {
            const nextAccounts = await getAccounts()
            console.log(nextAccounts);
            setAccounts(nextAccounts)
            setError(null)
            return nextAccounts
        } catch (loadError) {
            const message = loadError instanceof Error ? loadError.message : 'Failed to fetch accounts'
            setAccounts([])
            setError(message)
            return []
        } finally {
            setIsLoading(false)
        }
    }, [])

    const clearAccountsError = useCallback(() => {
        setError(null)
    }, [])

    useEffect(() => {
        refreshAccounts()
    }, [refreshAccounts])

    const value = useMemo(
        () => ({
            accounts,
            isLoading,
            error,
            refreshAccounts,
            clearAccountsError,
        }),
        [accounts, clearAccountsError, error, isLoading, refreshAccounts],
    )

    return <AccountsContext.Provider value={value}>{children}</AccountsContext.Provider>
}

export function useAccountsContext() {
    const context = useContext(AccountsContext)

    if (!context) {
        throw new Error('useAccountsContext must be used within AppProviders')
    }

    return context
}