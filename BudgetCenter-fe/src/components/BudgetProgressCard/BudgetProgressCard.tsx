import "./BudgetProgressCard.css";

type BudgetProgressCardProps = {
    title: string
    spent: number
    budgetAmount: number
    percentUsed: number
}

export default function BudgetProgressCard({ title, spent, budgetAmount, percentUsed }: BudgetProgressCardProps) {

    return (
        <div className="budget-progress-card my-2">
            <div className="budget-progress-card__card card w-full">
                <div className="card-body">
                    <div className="mb-2.5 px-2 head">
                        <h5 className="card-title">{title}</h5>
                        <span className="budget-percent">
                            <strong>{percentUsed}%</strong>
                        </span>
                    </div>
                    <div className="bottom mx-2">
                        <div className="spent-budget">
                            <span className="spent mr-1">Spent:</span>
                            <span>
                                <strong className="spent-num">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(spent)}
                                </strong>
                            </span>
                            <span className="slash mx-0.5">/</span>
                            <span className="budget mr-1">Budget:</span>
                            <span>
                                <strong className="budget-num">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(budgetAmount)}
                                </strong>
                            </span>
                        </div>
                        <div className="budget-bar mt-2 mb-2">
                            <div className="progress w-full" role="progressbar" aria-label="Progressbar" aria-valuenow={percentUsed} aria-valuemin={0} aria-valuemax={100}>
                                <div className="progress-bar" style={{ width: `${percentUsed}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}