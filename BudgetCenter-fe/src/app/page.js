
import BudgetCard from "../components/BudgetCard/BudgetCard";
import BalanceCard from "../components/BalanceCard/BalanceCard";
import SavingsCard from "../components/SavingsCard/SavingsCard";
import BudgetDropdown from "../components/BudgetDropdown/BudgetDropdown";
import "./Home.css"

export default function Home() {
  return (
    <div className="dashboard">

      <h4 className="welcome-text">Welcome User</h4>

      <div className="top-header">
        <h1 className="main-header">Financial Dashboard</h1>
        <BudgetDropdown/>
      </div>

      <div className="cards-row">
        <BalanceCard/>
        <BudgetCard/>
        <SavingsCard/>
      </div>

      <div className="budget-chart m-2">
        <div id="apex-multiple-column-charts" className="w-full"></div>
      </div>

    </div>
  );
}
