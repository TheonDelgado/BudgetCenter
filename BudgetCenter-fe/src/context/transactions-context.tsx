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
import { getTransactions } from '../app/services/transactions.service'
import { Transaction } from '../types/transaction'

type TransactionsContextValue = {
	transactions: Transaction[]
	isLoading: boolean
	error: string | null
	refreshTransactions: () => Promise<Transaction[]>
	clearTransactionsError: () => void
}

const TransactionsContext = createContext<TransactionsContextValue | undefined>(undefined)

export function TransactionsProvider({ children }: { children: ReactNode }) {
	const [transactions, setTransactions] = useState<Transaction[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const refreshTransactions = useCallback(async () => {
		setIsLoading(true)

		try {
			const nextTransactions = await getTransactions()
			setTransactions(nextTransactions)

            console.log(nextTransactions);

			setError(null)
			return nextTransactions
		} catch (loadError) {
			const message = loadError instanceof Error ? loadError.message : 'Failed to fetch transactions'
			setTransactions([])
			setError(message)
			return []
		} finally {
			setIsLoading(false)
		}
	}, [])

	const clearTransactionsError = useCallback(() => {
		setError(null)
	}, [])

	useEffect(() => {
		refreshTransactions()
	}, [refreshTransactions])

	const value = useMemo(
		() => ({
			transactions,
			isLoading,
			error,
			refreshTransactions,
			clearTransactionsError,
		}),
		[transactions, clearTransactionsError, error, isLoading, refreshTransactions],
	)

	return <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>
}

export function useTransactionsContext() {
	const context = useContext(TransactionsContext)

	if (!context) {
		throw new Error('useTransactionsContext must be used within AppProviders')
	}

	return context
}
