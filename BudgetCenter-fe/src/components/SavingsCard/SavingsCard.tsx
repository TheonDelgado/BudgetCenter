import "./SavingsCard.css"

export default function SavingsCard() {
    return (
        <div className="card card-xs sm:max-w-sm m-2">
            <div className="card-body">
                <div className="mb-2.5 px-2 head">
                    <h5 className="card-title">Savings Goals</h5>
                    <span className="savings-icon icon-[tabler--diamond]"></span>
                </div>
                <div className="lower mx-2">
                    <div className="savings-nums">
                        <span>
                            <strong className="saved-num">$2,591</strong>
                        </span>
                        <span className="slash mx-0.5">/</span>
                        <span>
                            <strong className="saved-goal-num">$3,500</strong>
                        </span>
                        <span className="savings-percent">82%</span>
                    </div>
                    <div className="budget-bar mt-2 mb-2">
                        <div className="progress w-full" role="progressbar" aria-label="Progressbar" aria-valuenow={75} aria-valuemin={0} aria-valuemax={100}>
                            <div className="progress-bar w-82/100"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}