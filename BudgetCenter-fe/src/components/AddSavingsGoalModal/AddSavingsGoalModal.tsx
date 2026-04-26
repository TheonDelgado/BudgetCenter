import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import '../AddBudgetModal/AddBudgetModal.css'

type AddSavingsGoalModalProps = {
    selectedMonth: string
    initialAmount: number
    isSaving: boolean
    error: string | null
    onSave: (amount: number) => Promise<void>
    onClearError: () => void
}

export default function AddSavingsGoalModal({
    selectedMonth,
    initialAmount,
    isSaving,
    error,
    onSave,
    onClearError,
}: AddSavingsGoalModalProps) {
    const [amount, setAmount] = useState('')

    useEffect(() => {
        setAmount(initialAmount > 0 ? initialAmount.toFixed(2) : '')
    }, [initialAmount, selectedMonth])

    function handleAmountChange(event: ChangeEvent<HTMLInputElement>) {
        const nextAmount = event.target.value
        if (/^\d*(\.\d{0,2})?$/.test(nextAmount)) {
            setAmount(nextAmount)
        }
    }

    function closeModal() {
        const overlay = (window as Window & {
            HSOverlay?: {
                getInstance: (
                    target: string,
                    isInstance?: boolean,
                ) => { element?: { close: (immediate?: boolean) => Promise<unknown> } } | null
            }
        }).HSOverlay

        const instance = overlay?.getInstance('#slide-up-savings-goal-modal', true)
        instance?.element?.close(true)

        document.querySelector('#slide-up-savings-goal-modal-backdrop')?.remove()
        document.body.style.overflow = ''
        document.body.classList.remove('overlay-body-open')
        onClearError()
    }

    async function saveGoal(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const nextAmount = Number(amount)
        if (!Number.isFinite(nextAmount) || nextAmount <= 0) {
            return
        }

        await onSave(nextAmount)
        closeModal()
    }

    return (
        <div id="slide-up-savings-goal-modal" className="overlay modal [--overlay-backdrop:static] overlay-open:opacity-100 overlay-open:duration-300 hidden" role="dialog" tabIndex={-1} data-overlay-keyboard="false">
            <div className="overlay-animation-target modal-dialog overlay-open:mt-4 overlay-open:duration-300 mt-12 transition-all ease-out">
                <div className="modal-content">
                    <div className="modal-header">
                        <h3 className="modal-title">Set Savings Goal</h3>
                        <button type="button" className="btn btn-text btn-circle btn-sm absolute inset-e-3 top-3" aria-label="Close" onClick={closeModal}>
                            <span className="icon-[tabler--x] size-4"></span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={saveGoal} className="budget-form w-full h-full">
                            <label htmlFor="savings-goal-month" className="start-date-label">Month</label>
                            <input id="savings-goal-month" type="text" className="input w-full" value={selectedMonth} readOnly />

                            <label htmlFor="savings-goal-amount" className="budget-amount-label">Savings Goal Amount</label>
                            <input
                                id="savings-goal-amount"
                                type="text"
                                className="input w-full"
                                placeholder="Enter savings goal"
                                inputMode="decimal"
                                value={amount}
                                onChange={handleAmountChange}
                            />

                            {error ? <div className="text-xs text-red-500">{error}</div> : null}

                            <div className="modal-footer">
                                <button type="button" className="btn btn-soft bg-white text-black" onClick={closeModal}>
                                    Close
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                                    {isSaving ? 'Saving...' : 'Save goal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
