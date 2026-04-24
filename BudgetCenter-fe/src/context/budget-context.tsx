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
import { getBudgetItems } from '../app/services/budgets.service'
import { Budget } from '../types/budget'

type BudgetContextValue = {
	budgets: Budget[]
	isLoading: boolean
	error: string | null
	refreshBudgets: () => Promise<Budget[]>
	clearBudgetsError: () => void
}

const BudgetContext = createContext<BudgetContextValue | undefined>(undefined)

export function BudgetProvider({ children }: { children: ReactNode }) {
	const [budgets, setBudgets] = useState<Budget[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const refreshBudgets = useCallback(async () => {
		setIsLoading(true)

		try {
			const nextBudgets = await getBudgetItems()
			setBudgets(nextBudgets)

			console.log(nextBudgets);

			setError(null)
			return nextBudgets
		} catch (loadError) {
			const message = loadError instanceof Error ? loadError.message : 'Failed to fetch budgets'
			setBudgets([])
			setError(message)
			return []
		} finally {
			setIsLoading(false)
		}
	}, [])

	const clearBudgetsError = useCallback(() => {
		setError(null)
	}, [])

	useEffect(() => {
		refreshBudgets()
	}, [refreshBudgets])

	const value = useMemo(
		() => ({
			budgets,
			isLoading,
			error,
			refreshBudgets,
			clearBudgetsError,
		}),
		[budgets, clearBudgetsError, error, isLoading, refreshBudgets],
	)

	return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>
}

export function useBudgetContext() {
	const context = useContext(BudgetContext)

	if (!context) {
		throw new Error('useBudgetContext must be used within AppProviders')
	}

	return context
}
