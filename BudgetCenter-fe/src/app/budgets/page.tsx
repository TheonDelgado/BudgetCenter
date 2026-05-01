'use client'

import { useEffect, useMemo } from "react";
import BudgetDropdown from "../../components/BudgetDropdown/BudgetDropdown";
import "./budgets.css"
import BudgetProgressCard from "../../components/BudgetProgressCard/BudgetProgressCard";
import BudgetCard from "../../components/BudgetCard/BudgetCard";
import AddButtonModal from "../../components/AddBudgetModal/AddBudgetModal";
import AddSavingsGoalModal from "../../components/AddSavingsGoalModal/AddSavingsGoalModal";
import { useBudgetContext } from "../../context/budget-context";
import { useMonthlyBudgetSummary } from "../../context/monthly-budget-summary";
import { useSavingsContext } from "../../context/savings-context";
import { useTransactionsContext } from "../../context/transactions-context";
import { destroyChart, renderChart } from "../../utils/budgetChart";

const BUDGETS_CHART_SELECTOR = "#apex-budgets-spent-vs-budget-chart";

function toMonthLabel(value?: string | null) {
    if (!value) {
        return "";
    }

    const raw = String(value).trim();
    if (!raw) {
        return "";
    }

    const parsedDate = new Date(raw);
    if (!Number.isNaN(parsedDate.getTime())) {
        return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(parsedDate);
    }

    if (/^[A-Za-z]+\s+\d{4}$/.test(raw)) {
        return raw;
    }

    return `${raw} ${new Date().getFullYear()}`;
}

function toMonthDate(label: string) {
    const parsed = new Date(label);
    if (!Number.isNaN(parsed.getTime())) {
        return parsed;
    }

    const parts = String(label).trim().split(/\s+/);
    if (parts.length === 2) {
        const [monthName, yearValue] = parts;
        const monthDate = new Date(`${monthName} 1, ${yearValue}`);
        if (!Number.isNaN(monthDate.getTime())) {
            return monthDate;
        }
    }

    return null;
}

export default function Budgets() {
    const { isLoading, error: budgetsError, selectedMonth, setSelectedMonth, monthOptions, budgets } = useBudgetContext();
    const { budgetSummaries, totalSpent, totalBudget, totalPercentUsed, refreshBudgets } = useMonthlyBudgetSummary()
    const { summary, trend, isSavingGoal, error: savingsError, saveMonthlyGoal, clearSavingsError } = useSavingsContext()
    const { transactions } = useTransactionsContext()

    const chartData = useMemo(() => {
        const budgetTotalsByMonth = budgets.reduce((acc, budget) => {
            const monthKey = toMonthLabel(budget.month);
            if (!monthKey) {
                return acc;
            }

            const budgetAmount = Number(budget.amount) || 0;
            acc.set(monthKey, (acc.get(monthKey) ?? 0) + budgetAmount);
            return acc;
        }, new Map<string, number>());

        const spendingTotalsByMonth = transactions.reduce((acc, transaction) => {
            if (transaction.pending || !transaction.isSpending) {
                return acc;
            }

            const monthKey = toMonthLabel(transaction.authorized_date ?? transaction.date);
            if (!monthKey) {
                return acc;
            }

            const amount = Number(transaction.amount) || 0;
            if (amount <= 0) {
                return acc;
            }

            acc.set(monthKey, (acc.get(monthKey) ?? 0) + amount);
            return acc;
        }, new Map<string, number>());

        const budgetMonths = budgets
            .map((budget) => toMonthLabel(budget.month))
            .filter(Boolean);

        const transactionMonths = transactions
            .map((transaction) => toMonthLabel(transaction.authorized_date ?? transaction.date))
            .filter(Boolean);

        const months = Array.from(new Set([
            ...budgetMonths,
            ...transactionMonths,
            ...Array.from(budgetTotalsByMonth.keys()),
            ...Array.from(spendingTotalsByMonth.keys()),
        ])).sort((left, right) => {
            const leftDate = toMonthDate(left);
            const rightDate = toMonthDate(right);

            if (leftDate && rightDate) {
                return leftDate.getTime() - rightDate.getTime();
            }

            return String(left).localeCompare(String(right));
        });

        return {
            monthLabels: months,
            budgetAmounts: months.map((month) => budgetTotalsByMonth.get(month) ?? 0),
            spentAmounts: months.map((month) => spendingTotalsByMonth.get(month) ?? 0),
        };
    }, [budgets, transactions]);

    useEffect(() => {
        renderChart({
            selector: BUDGETS_CHART_SELECTOR,
            monthLabels: chartData.monthLabels,
            budgetAmounts: chartData.budgetAmounts,
            spentAmounts: chartData.spentAmounts,
        });

        return () => {
            destroyChart(BUDGETS_CHART_SELECTOR);
        };
    }, [chartData.budgetAmounts, chartData.monthLabels, chartData.spentAmounts]);

    function openAddBudgetModal() {
        (window as Window & {
            HSOverlay?: { open: (target: string) => void }
        }).HSOverlay?.open("#slide-up-animated-modal")
    }

    function openSavingsGoalModal() {
        (window as Window & {
            HSOverlay?: { open: (target: string) => void }
        }).HSOverlay?.open("#slide-up-savings-goal-modal")
    }

    return (
        <div className="budgets-page">

            <h4 className="welcome-text">Welcome User</h4>

            <div className="top-part">
                <h1 className="main-header">Manage Your Budgets</h1>
                <BudgetDropdown
                    selectedMonth={selectedMonth}
                    monthOptions={monthOptions}
                    onMonthChange={setSelectedMonth}
                />
            </div>

            <div className="bottom-part pt-4">
                <button type="button" className="btn btn-primary" aria-haspopup="dialog" aria-expanded="false" aria-controls="slide-up-animated-modal" onClick={openAddBudgetModal}>
                    <span className="icon-[tabler--plus-filled]"></span>
                    <span>Add New Budget</span>
                </button>
                <button type="button" className="btn btn-soft" aria-haspopup="dialog" aria-expanded="false" aria-controls="slide-up-savings-goal-modal" onClick={openSavingsGoalModal}>
                    <span className="icon-[tabler--target-arrow]"></span>
                    <span>Set Savings Goal</span>
                </button>
            </div>

            <AddButtonModal refreshBudgets={refreshBudgets}/>
            <AddSavingsGoalModal
                selectedMonth={selectedMonth}
                initialAmount={summary?.targetAmount ?? 0}
                isSaving={isSavingGoal}
                error={savingsError}
                onSave={saveMonthlyGoal}
                onClearError={clearSavingsError}
            />

            {budgetsError ? <div className="alert alert-soft alert-error mt-4">{budgetsError}</div> : null}

            {isLoading ? <div className="text-sm text-gray-500 mt-4">Loading budgets...</div> : null}

            {!isLoading && budgetSummaries.length === 0 ? (
                <div className="text-sm text-gray-500 mt-4">Create your first budget to start tracking category spending.</div>
            ) : null}

            {!isLoading && budgetSummaries.length > 0 ? (
                <>
                    <BudgetProgressCard
                        title={`${selectedMonth} Budget Progress`}
                        spent={totalSpent}
                        budgetAmount={totalBudget}
                        percentUsed={totalPercentUsed}
                    />

                    <div className="flex flex-wrap justify-start">
                        {budgetSummaries.map(({ budget, spent, percentUsed }) => (
                            <BudgetCard
                                key={budget.id}
                                budget={budget}
                                spent={spent}
                                percentUsed={percentUsed}
                            />
                        ))}
                    </div>

                    <div className="budget-chart m-2">
                        <h2 className="text-lg font-semibold mb-2">Spent vs Budget</h2>
                        <div id="apex-budgets-spent-vs-budget-chart" className="w-full"></div>
                    </div>
                </>
            ) : null}
        </div>
    );
}