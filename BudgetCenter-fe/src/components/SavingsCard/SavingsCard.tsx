import "./SavingsCard.css"
import { useMemo } from 'react'
import { useSavingsContext } from '../../context/savings-context'

export default function SavingsCard() {
    const { summary } = useSavingsContext()

    const currencyFormatter = useMemo(
        () => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
        [],
    )

    const savedAmount = summary?.savedAmount ?? 0
    const targetAmount = summary?.targetAmount ?? 0
    const percent = summary?.percent ?? 0

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
                            <strong className="saved-num">{currencyFormatter.format(savedAmount)}</strong>
                        </span>
                        <span className="slash mx-0.5">/</span>
                        <span>
                            <strong className="saved-goal-num">{currencyFormatter.format(targetAmount)}</strong>
                        </span>
                        <span className="savings-percent">{percent}%</span>
                    </div>
                    <div className="budget-bar mt-2 mb-2">
                        <div className="progress w-full" role="progressbar" aria-label="Progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
                            <div className="progress-bar" style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}