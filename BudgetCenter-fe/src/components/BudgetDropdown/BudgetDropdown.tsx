import "./BudgetDropdown.css"

export default function BudgetDropdown() {
    return (
        <div className="dropdown relative inline-flex">
            <button id="dropdown-default" type="button" className="dropdown-toggle btn" aria-haspopup="menu" aria-expanded="false" aria-label="Dropdown">
                October 2025
                <span className="icon-[tabler--chevron-down] dropdown-open:rotate-180 size-4"></span>
            </button>
            <ul className="dropdown-menu dropdown-open:opacity-100 hidden min-w-60" role="menu" aria-orientation="vertical" aria-labelledby="dropdown-default">
                <li><a className="dropdown-item">September 2025</a></li>
                <li><a className="dropdown-item">August 2025</a></li>
                <li><a className="dropdown-item">July 2025</a></li>
                <li><a className="dropdown-item">June 2025</a></li>
            </ul>
        </div>
    );
}