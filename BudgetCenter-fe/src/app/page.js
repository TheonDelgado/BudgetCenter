'use client'

import BalanceCard from "../components/BalanceCard/BalanceCard";
import SavingsCard from "../components/SavingsCard/SavingsCard";
import BudgetDropdown from "../components/BudgetDropdown/BudgetDropdown";
import HomeMonthlyBudgetCard from "../components/HomeMonthlyBudgetCard/HomeMonthlyBudgetCard";
import "./Home.css"
import { useEffect } from "react";
import { destroyChart, renderChart } from "../utils/budgetChart";
import { useBudgetContext } from "../context/budget-context";
import { useMonthlyBudgetSummary } from "../context/monthly-budget-summary";

export default function Home() {
  const { selectedMonth, setSelectedMonth, monthOptions } = useBudgetContext();
  const { totalSpent, totalBudget, totalPercentUsed } = useMonthlyBudgetSummary()

  useEffect(() => {
    renderChart();

    return () => {
      destroyChart();
    };
  }, [])

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
        <div id="apex-multiple-column-charts" className="w-full"></div>
      </div>

    </div>
  );
}
