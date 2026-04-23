'use client'

import { useCallback, useEffect, useState } from "react"
import BudgetDropdown from "../../components/BudgetDropdown/BudgetDropdown";
import "./budgets.css"
import BudgetProgressCard from "../../components/BudgetProgressCard/BudgetProgressCard";

export default function Budgets() {
    return (
        <div className="budgets-page">

            <h4 className="welcome-text">Welcome User</h4>

            <div className="top-part">
                <h1 className="main-header">Manage Your Budgets</h1>
                <BudgetDropdown />
            </div>

            <div className="bottom-part pt-4">
                <button className="btn btn-info add-account-button">
                    <span className="icon-[tabler--plus-filled]"></span>
                    <span>Add New Account</span>
                </button>
            </div>

            <BudgetProgressCard/>
        </div>
    );
}