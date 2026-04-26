'use client'

import { ReactNode } from 'react'
import { AccountsProvider } from './accounts-context'
import { BudgetProvider } from './budget-context'
import { SavingsProvider } from './savings-context'
import { TransactionsProvider } from './transactions-context'

export default function AppProviders({ children }: { children: ReactNode }) {
    return (
        <AccountsProvider>
            <BudgetProvider>
                <TransactionsProvider>
                    <SavingsProvider>{children}</SavingsProvider>
                </TransactionsProvider>
            </BudgetProvider>
        </AccountsProvider>
    )
}