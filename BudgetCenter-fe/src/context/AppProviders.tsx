'use client'

import { ReactNode } from 'react'
import { AccountsProvider } from './accounts-context'
import { BudgetProvider } from './budget-context'

export default function AppProviders({ children }: { children: ReactNode }) {
    return (
        <AccountsProvider>
            <BudgetProvider>{children}</BudgetProvider>
        </AccountsProvider>
    )
}