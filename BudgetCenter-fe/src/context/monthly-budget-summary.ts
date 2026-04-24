'use client'

import { useMemo } from 'react'
import { useBudgetContext } from './budget-context'
import { useTransactionsContext } from './transactions-context'

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

export function useMonthlyBudgetSummary() {
    const { budgetsForSelectedMonth, selectedMonth } = useBudgetContext()
    const { transactions } = useTransactionsContext()

    const budgetSummaries = useMemo(() => {
        return budgetsForSelectedMonth.map((budget) => {
            const budgetAmount = Number(budget.amount) || 0
            const budgetCategory = String(budget.category ?? 'Uncategorized').toLowerCase()
            const spent = transactions.reduce((sum, transaction) => {
                if (transaction.pending) {
                    return sum
                }

                const transactionMonth = toMonthLabel(transaction.authorized_date ?? transaction.date)
                if (transactionMonth !== selectedMonth) {
                    return sum
                }

                if (!transaction.isSpending) {
                    return sum
                }

                if ((transaction.budgetCategoryName ?? '').toLowerCase() !== budgetCategory) {
                    return sum
                }

                const nextAmount = Number(transaction.amount)
                return nextAmount > 0 ? sum + nextAmount : sum
            }, 0)

            const percentUsed = budgetAmount > 0
                ? Math.min(100, Math.round((spent / budgetAmount) * 100))
                : 0

            return {
                budget,
                spent,
                budgetAmount,
                percentUsed,
            }
        })
    }, [budgetsForSelectedMonth, selectedMonth, transactions])

    const totalBudget = budgetSummaries.reduce((sum, item) => sum + item.budgetAmount, 0)
    const totalSpent = budgetSummaries.reduce((sum, item) => sum + item.spent, 0)
    const totalPercentUsed = totalBudget > 0
        ? Math.min(100, Math.round((totalSpent / totalBudget) * 100))
        : 0

    return {
        budgetSummaries,
        totalBudget,
        totalSpent,
        totalPercentUsed,
        selectedMonth,
    }
}
