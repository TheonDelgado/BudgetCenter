import "../SavingsCard/SavingsCard.css"

type HomeMonthlyBudgetCardProps = {
    monthLabel: string
    spent: number
    budgetAmount: number
    percentUsed: number
}

export default function HomeMonthlyBudgetCard({
    monthLabel,
    spent,
    budgetAmount,
    percentUsed,
}: HomeMonthlyBudgetCardProps) {
    const spentFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(spent)
    const budgetFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(budgetAmount)

    return (
        <div className="card card-xs sm:max-w-sm m-2">
            <div className="card-body">
                <div className="mb-2.5 px-2 head">
                    <h5 className="card-title">{monthLabel} Budget</h5>
                    <span className="savings-icon icon-[tabler--calendar-stats]"></span>
                </div>
                <div className="lower mx-2">
                    <div className="savings-nums">
                        <span>
                            <strong className="saved-num">{spentFormatted}</strong>
                        </span>
                        <span className="slash mx-0.5">/</span>
                        <span>
                            <strong className="saved-goal-num">{budgetFormatted}</strong>
                        </span>
                        <span className="savings-percent">{percentUsed}%</span>
                    </div>
                    <div className="budget-bar mt-2 mb-2">
                        <div className="progress w-full" role="progressbar" aria-label="Progressbar" aria-valuenow={percentUsed} aria-valuemin={0} aria-valuemax={100}>
                            <div className="progress-bar" style={{ width: `${percentUsed}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
