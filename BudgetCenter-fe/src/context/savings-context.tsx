'use client'

import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'
import {
    getSavingsMonthlySummary,
    getSavingsTrend,
    ingestSavingsSnapshot,
    upsertSavingsGoal,
} from '../app/services/savings.service'
import type { SavingsSummary, SavingsTrendPoint } from '../types/savings'
import { useBudgetContext } from './budget-context'

type SavingsContextValue = {
    summary: SavingsSummary | null
    trend: SavingsTrendPoint[]
    isLoading: boolean
    isSavingGoal: boolean
    error: string | null
    refreshSavings: () => Promise<void>
    saveMonthlyGoal: (amount: number) => Promise<void>
    clearSavingsError: () => void
}

const SavingsContext = createContext<SavingsContextValue | undefined>(undefined)

export function SavingsProvider({ children }: { children: ReactNode }) {
    const { selectedMonth } = useBudgetContext()
    const [summary, setSummary] = useState<SavingsSummary | null>(null)
    const [trend, setTrend] = useState<SavingsTrendPoint[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSavingGoal, setIsSavingGoal] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const refreshSavings = useCallback(async () => {
        setIsLoading(true)

        try {
            await ingestSavingsSnapshot(selectedMonth)
            const [nextSummary, nextTrend] = await Promise.all([
                getSavingsMonthlySummary(selectedMonth),
                getSavingsTrend(6),
            ])

            setSummary(nextSummary)
            setTrend(nextTrend)
            setError(null)
        } catch (loadError) {
            const message = loadError instanceof Error ? loadError.message : 'Failed to load savings data'
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }, [selectedMonth])

    const saveMonthlyGoal = useCallback(
        async (amount: number) => {
            setIsSavingGoal(true)

            try {
                await upsertSavingsGoal(selectedMonth, amount)
                await refreshSavings()
                setError(null)
            } catch (saveError) {
                const message = saveError instanceof Error ? saveError.message : 'Failed to save savings goal'
                setError(message)
            } finally {
                setIsSavingGoal(false)
            }
        },
        [refreshSavings, selectedMonth],
    )

    const clearSavingsError = useCallback(() => {
        setError(null)
    }, [])

    useEffect(() => {
        refreshSavings()
    }, [refreshSavings])

    const value = useMemo(
        () => ({
            summary,
            trend,
            isLoading,
            isSavingGoal,
            error,
            refreshSavings,
            saveMonthlyGoal,
            clearSavingsError,
        }),
        [summary, trend, isLoading, isSavingGoal, error, refreshSavings, saveMonthlyGoal, clearSavingsError],
    )

    return <SavingsContext.Provider value={value}>{children}</SavingsContext.Provider>
}

export function useSavingsContext() {
    const context = useContext(SavingsContext)

    if (!context) {
        throw new Error('useSavingsContext must be used within AppProviders')
    }

    return context
}
