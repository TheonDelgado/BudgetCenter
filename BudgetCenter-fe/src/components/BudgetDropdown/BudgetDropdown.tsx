import "./BudgetDropdown.css"

type BudgetDropdownProps = {
    selectedMonth: string
    monthOptions: string[]
    onMonthChange: (value: string) => void
}

export default function BudgetDropdown({ selectedMonth, monthOptions, onMonthChange }: BudgetDropdownProps) {
    return (
        <select
            className="select select-sm dropdown-toggle budget-dropdown-select"
            aria-label="Select budget month"
            value={selectedMonth}
            onChange={(event) => onMonthChange(event.target.value)
            
            }
        >
            {monthOptions.map((month) => (
                <option key={month} value={month}>{month}</option>
            ))}
        </select>
    );
}