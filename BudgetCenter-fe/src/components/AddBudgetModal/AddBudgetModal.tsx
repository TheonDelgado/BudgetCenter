import "./AddBudgetModal.css"

export default function AddButtonModal() {
    return (
        <div id="slide-up-animated-modal" className="overlay modal overlay-open:opacity-100 overlay-open:duration-300 hidden" role="dialog" tabIndex={-1}>
            <div className="overlay-animation-target modal-dialog overlay-open:mt-4 overlay-open:duration-300 mt-12 transition-all ease-out" >
                <div className="modal-content">
                    <div className="modal-header">
                        <h3 className="modal-title">Add Budget</h3>
                        <button type="button" className="btn btn-text btn-circle btn-sm absolute end-3 top-3" aria-label="Close" data-overlay="#slide-up-animated-modal">
                            <span className="icon-[tabler--x] size-4"></span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <form className="budget-form w-full h-full">
                            <label htmlFor="budget-name" className="budget-name-label">Budget Name</label>
                            <input type="text" id="budget-name" placeholder="Enter Name of Budget" className="input w-full" />
                            <label htmlFor="budget-amount" className="budget-amount-label">Budget Amount</label>
                            <input type="text" id="budget-amount" placeholder="Enter Name of Budget" className="input w-full" />
                            <label htmlFor="start-date" className="start-date-label">Choose a Start Month</label>
                            <select id="start-date" className="select max-w-sm appearance-none" aria-label="select">
                                <option disabled selected>Choose Start Month:</option>
                                <option>January</option>
                                <option>Feburary</option>
                                <option>March</option>
                                <option>April</option>
                                <option>May</option>
                                <option>June</option>
                                <option>July</option>
                                <option>August</option>
                                <option>September</option>
                                <option>October</option>
                                <option>November</option>
                                <option>December</option>
                            </select>
                            <label htmlFor="end-date" className="end-date-label">Choose a End Month</label>
                            <select id="end-date" className="select max-w-sm appearance-none" aria-label="select">
                                <option disabled selected>Choose Start Month:</option>
                                <option>January</option>
                                <option>Feburary</option>
                                <option>March</option>
                                <option>April</option>
                                <option>May</option>
                                <option>June</option>
                                <option>July</option>
                                <option>August</option>
                                <option>September</option>
                                <option>October</option>
                                <option>November</option>
                                <option>December</option>
                            </select>
                        </form>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-soft bg-white text-black" data-overlay="#slide-up-animated-modal">
                            Close
                        </button>
                        <button type="button" className="btn btn-primary">Save changes</button>
                    </div>
                </div>
            </div>
        </div>
    );
}