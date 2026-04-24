import "./AddBudgetModal.css"
import { useRef, useState, type ChangeEvent, type FormEvent } from "react"
import { createBudgetItem } from "../../app/services/budgets.service"
import { SPENDING_BUDGET_CATEGORY_OPTIONS } from "../../utils/budgetCategoryMap"

function getMonthOptions(baseDate = new Date()) {
    const formatter = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric',
    })

    return Array.from({ length: 18 }, (_, index) => {
        const nextDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + index, 1)
        return formatter.format(nextDate)
    })
}

export default function AddButtonModal() {
    const closeModalButtonRef = useRef<HTMLButtonElement | null>(null);
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState("");
    const [type, setType] = useState("");
    const [month, setMonth] = useState("");
    const monthOptions = getMonthOptions()

    function handleAmountChange(e: ChangeEvent<HTMLInputElement>) {
        const nextAmount = e.target.value;
        if (/^\d*(\.\d{0,2})?$/.test(nextAmount)) {
            setAmount(nextAmount);
        }
    }

    async function createBudget(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        await createBudgetItem(name, category, Number(amount), type, month);
        setName("");
        setCategory("");
        setAmount("");
        setType("");
        setMonth("");
        closeModalButtonRef.current?.click();
    }

    return (
        <div id="slide-up-animated-modal" className="overlay modal overlay-open:opacity-100 overlay-open:duration-300 hidden" role="dialog" tabIndex={-1}>
            <div className="overlay-animation-target modal-dialog overlay-open:mt-4 overlay-open:duration-300 mt-12 transition-all ease-out" >
                <div className="modal-content">
                    <div className="modal-header">
                        <h3 className="modal-title">Add Budget</h3>
                        <button type="button" className="btn btn-text btn-circle btn-sm absolute inset-e-3 top-3" aria-label="Close" data-overlay="#slide-up-animated-modal" ref={closeModalButtonRef}>
                            <span className="icon-[tabler--x] size-4"></span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={createBudget} className="budget-form w-full h-full">
                            <label htmlFor="budget-name" className="budget-name-label">Budget Name</label>
                            <input type="text" id="budget-name" placeholder="Enter Name of Budget" className="input w-full" value={name} onChange={e => setName(e.target.value)} />
                            <label htmlFor="budget-category" className="budget-type-label">Budget Category</label>
                            <select id="budget-category" className="select max-w-sm appearance-none" aria-label="select" value={category} onChange={e => setCategory(e.target.value)}>
                                <option disabled value="">Choose Category:</option>
                                {SPENDING_BUDGET_CATEGORY_OPTIONS.map(option => (
                                    <option key={option.key} value={option.name}>{option.name}</option>
                                ))}
                            </select>
                            <label htmlFor="budget-amount" className="budget-amount-label">Budget Amount</label>
                            <input type="text" id="budget-amount" placeholder="Enter Amount" className="input w-full" value={amount} inputMode="decimal" onChange={handleAmountChange} />
                            <label htmlFor="budget-type" className="budget-type-label">Budget Type</label>
                            <select id="budget-type" className="select max-w-sm appearance-none" aria-label="select" value={type} onChange={e => setType(e.target.value)}>
                                <option disabled value="">Choose Type:</option>
                                <option>Monthly</option>
                                <option>Misc</option>
                            </select>
                            <label htmlFor="budget-month" className="start-date-label">Budget Month</label>
                            <select id="budget-month" className="select max-w-sm appearance-none" aria-label="select" value={month} onChange={e => setMonth(e.target.value)}>
                                <option disabled value="">Choose Month:</option>
                                {monthOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-soft bg-white text-black" data-overlay="#slide-up-animated-modal">
                                    Close
                                </button>
                                <button type="submit" className="btn btn-primary">Save changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}