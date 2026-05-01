'use client'

import BalanceCard from "../components/BalanceCard/BalanceCard";
import SavingsCard from "../components/SavingsCard/SavingsCard";
import BudgetDropdown from "../components/BudgetDropdown/BudgetDropdown";
import HomeMonthlyBudgetCard from "../components/HomeMonthlyBudgetCard/HomeMonthlyBudgetCard";
import "./Home.css"
import { useEffect, useMemo } from "react";
import { destroyChart, renderChart } from "../utils/budgetChart";
import { useBudgetContext } from "../context/budget-context";
import { useMonthlyBudgetSummary } from "../context/monthly-budget-summary";
import { useSavingsContext } from "../context/savings-context";
import { useTransactionsContext } from "../context/transactions-context";

const HOME_BUDGET_PROGRESS_SELECTOR = "#apex-home-budgets-progress-chart";

function toMonthLabel(value) {
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

function toMonthDate(label) {
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

export default function Home() {
  const { selectedMonth, setSelectedMonth, monthOptions, budgets } = useBudgetContext();
  const { totalSpent, totalBudget, totalPercentUsed } = useMonthlyBudgetSummary()
  const { summary, trend } = useSavingsContext();
  const { transactions } = useTransactionsContext();

  const chartData = useMemo(() => {
    const budgetsByMonth = budgets.reduce((acc, budget) => {
      const monthKey = toMonthLabel(budget.month);
      if (!monthKey) {
        return acc;
      }

      const nextBudgets = acc.get(monthKey) ?? [];
      nextBudgets.push(budget);
      acc.set(monthKey, nextBudgets);
      return acc;
    }, new Map());

    const budgetProgressByMonth = new Map(
      Array.from(budgetsByMonth.entries()).map(([monthKey, budgetsForMonth]) => {
        const monthSpent = budgetsForMonth.reduce((budgetSum, budget) => {
          const budgetCategory = String(budget.category ?? "Uncategorized").toLowerCase();

          const spentForCategory = transactions.reduce((txSum, transaction) => {
            if (transaction.pending || !transaction.isSpending) {
              return txSum;
            }

            const transactionMonth = toMonthLabel(transaction.authorized_date ?? transaction.date);
            if (transactionMonth !== monthKey) {
              return txSum;
            }

            if ((transaction.budgetCategoryName ?? "").toLowerCase() !== budgetCategory) {
              return txSum;
            }

            const amount = Number(transaction.amount) || 0;
            return amount > 0 ? txSum + amount : txSum;
          }, 0);

          return budgetSum + spentForCategory;
        }, 0);

        return [monthKey, Math.round(monthSpent * 100) / 100];
      }),
    );

    const savingsProgressByMonth = trend.reduce((acc, point) => {
      const monthKey = toMonthLabel(point.monthKey);
      if (!monthKey) {
        return acc;
      }

      acc.set(monthKey, Number(point.savedAmount) || 0);
      return acc;
    }, new Map());

    const budgetMonths = budgets
      .map((budget) => toMonthLabel(budget.month))
      .filter(Boolean);

    const months = Array.from(new Set([
      ...budgetMonths,
      ...Array.from(budgetProgressByMonth.keys()),
      ...Array.from(savingsProgressByMonth.keys()),
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
      budgetProgressAmounts: months.map((month) => budgetProgressByMonth.get(month) ?? 0),
      savingsProgressAmounts: months.map((month) => savingsProgressByMonth.get(month) ?? 0),
    };
  }, [budgets, transactions, trend]);

  useEffect(() => {
    renderChart({
      selector: HOME_BUDGET_PROGRESS_SELECTOR,
      monthLabels: chartData.monthLabels,
      spentAmounts: chartData.budgetProgressAmounts,
      budgetAmounts: chartData.savingsProgressAmounts,
      primarySeriesName: "Budget Progress",
      secondarySeriesName: "Savings Progress",
      colors: ['var(--color-primary)', 'var(--color-success)'],
      goalLines: [
        { name: 'Budget', value: totalBudget, color: 'var(--color-primary)' },
        { name: 'Savings Goal', value: summary?.targetAmount ?? 0, color: 'var(--color-success)' },
      ],
    });

    return () => {
      destroyChart(HOME_BUDGET_PROGRESS_SELECTOR);
    };
  }, [chartData, summary?.targetAmount, totalBudget])

  return (
    <div className="dashboard">

      <h4 className="welcome-text">Welcome User</h4>

      <div className="top-header">
        <h1 className="main-header">Financial Dashboard</h1>
        <BudgetDropdown
          selectedMonth={selectedMonth}
          monthOptions={monthOptions}
          onMonthChange={setSelectedMonth}
        />
      </div>

      <div className="cards-row">
        <BalanceCard />
        <HomeMonthlyBudgetCard
          monthLabel={selectedMonth}
          spent={totalSpent}
          budgetAmount={totalBudget}
          percentUsed={totalPercentUsed}
        />
        <SavingsCard />
      </div>

      <div className="budget-chart m-2">
        <h2 className="text-lg font-semibold mb-2">Budget and Spending Progress</h2>
        <div id="apex-home-budgets-progress-chart" className="w-full"></div>
      </div>

    </div>
  );
}
