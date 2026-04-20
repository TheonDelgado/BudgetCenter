'use client'

import { ReactNode } from 'react'
import { AccountsProvider } from './accounts-context'

export default function AppProviders({ children }: { children: ReactNode }) {
    return <AccountsProvider>{children}</AccountsProvider>
}