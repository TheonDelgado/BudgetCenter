'use client'

import BudgetDropdown from "../../components/BudgetDropdown/BudgetDropdown";
import "./budgets.css"
import BudgetProgressCard from "../../components/BudgetProgressCard/BudgetProgressCard";
import BudgetCard from "../../components/BudgetCard/BudgetCard";
import AddButtonModal from "../../components/AddBudgetModal/AddBudgetModal";
import { useBudgetContext } from "../../context/budget-context";
import { useMonthlyBudgetSummary } from "../../context/monthly-budget-summary";

export default function Budgets() {
    const { isLoading, error: budgetsError, selectedMonth, setSelectedMonth, monthOptions } = useBudgetContext();
    const { budgetSummaries, totalSpent, totalBudget, totalPercentUsed } = useMonthlyBudgetSummary()

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
                <button type="button" className="btn btn-primary" aria-haspopup="dialog" aria-expanded="false" aria-controls="slide-up-animated-modal" data-overlay="#slide-up-animated-modal">
                    <span className="icon-[tabler--plus-filled]"></span>
                    <span>Add New Budget</span>
                </button>
            </div>

            <AddButtonModal/>

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
                </>
            ) : null}
        </div>
    );
}