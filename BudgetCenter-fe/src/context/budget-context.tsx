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
	selectedMonth: string
	setSelectedMonth: (month: string) => void
	monthOptions: string[]
	budgetsForSelectedMonth: Budget[]
	isLoading: boolean
	error: string | null
	refreshBudgets: () => Promise<Budget[]>
	clearBudgetsError: () => void
}

const BudgetContext = createContext<BudgetContextValue | undefined>(undefined)

function toMonthLabel(value?: string | null) {
	if (!value) {
		return ''
	}

	const raw = String(value).trim()
	if (!raw) {
		return ''
	}

	const parsedDate = new Date(raw)
	if (!Number.isNaN(parsedDate.getTime())) {
		return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(parsedDate)
	}

	if (/^[A-Za-z]+\s+\d{4}$/.test(raw)) {
		return raw
	}

	return `${raw} ${new Date().getFullYear()}`
}

function generateNextMonths(baseDate = new Date(), count = 12) {
	const formatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })

	return Array.from({ length: count }, (_, index) => {
		const nextDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + index, 1)
		return formatter.format(nextDate)
	})
}

export function BudgetProvider({ children }: { children: ReactNode }) {
	const [budgets, setBudgets] = useState<Budget[]>([])
	const [selectedMonth, setSelectedMonth] = useState(() => toMonthLabel(new Date().toISOString()))
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

	const monthOptions = useMemo(() => {
		const monthsFromBudgets = budgets
			.map((budget) => toMonthLabel(budget.month))
			.filter(Boolean)

		const futureMonths = generateNextMonths()
		return Array.from(new Set([...monthsFromBudgets, ...futureMonths]))
	}, [budgets])

	useEffect(() => {
		if (!monthOptions.length) {
			return
		}

		if (!monthOptions.includes(selectedMonth)) {
			setSelectedMonth(monthOptions[0])
		}
	}, [monthOptions, selectedMonth])

	const budgetsForSelectedMonth = useMemo(() => {
		return budgets.filter((budget) => {
			const budgetMonth = toMonthLabel(budget.month)
			return budgetMonth === selectedMonth
		})
	}, [budgets, selectedMonth])

	const value = useMemo(
		() => ({
			budgets,
			selectedMonth,
			setSelectedMonth,
			monthOptions,
			budgetsForSelectedMonth,
			isLoading,
			error,
			refreshBudgets,
			clearBudgetsError,
		}),
		[
			budgets,
			selectedMonth,
			monthOptions,
			budgetsForSelectedMonth,
			clearBudgetsError,
			error,
			isLoading,
			refreshBudgets,
		],
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
