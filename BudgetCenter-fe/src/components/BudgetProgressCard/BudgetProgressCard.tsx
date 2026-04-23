import "./BudgetProgressCard.css";

export default function BudgetProgressCard() {
    return (
        <div className="budget-progress-card mt-2">
            <div className="budget-progress-card__card card card-xs m-2 w-full">
                <div className="card-body">
                    <div className="mb-2.5 px-2 head">
                        <h5 className="card-title">October Budget</h5>
                        <span className="budget-percent">
                            <strong>75%</strong>
                        </span>
                    </div>
                    <div className="bottom mx-2">
                        <div className="spent-budget">
                            <span className="spent mr-1">Spent:</span>
                            <span>
                                <strong className="spent-num">$2,591</strong>
                            </span>
                            <span className="slash mx-0.5">/</span>
                            <span className="budget mr-1">Budget:</span>
                            <span>
                                <strong className="budget-num">$3,500</strong>
                            </span>
                        </div>
                        <div className="budget-bar mt-2 mb-2">
                            <div className="progress w-full" role="progressbar" aria-label="Progressbar" aria-valuenow={75} aria-valuemin={0} aria-valuemax={100}>
                                <div className="progress-bar w-3/4"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}