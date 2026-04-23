'use client'

import "./BalanceCard.css";
import { useAccountsContext } from "../../context/accounts-context";

export default function BalanceCard() {
    const { accounts, isLoading, error: accountsError } = useAccountsContext();


    let totalBalance = 0;
    const balance = accounts.forEach((x) => {
        totalBalance += x.balances.current;
    });

    const totalBalanceFormatted = totalBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })


    console.log(accounts);
    return (
        <div className="card card-xs sm:max-w-sm m-2">
            <div className="card-body">
                <div className="mb-2.5 px-2 head">
                    <h5 className="card-title ">Current Balance</h5>
                    <span className="balance-icon icon-[tabler--wallet]"></span>
                </div>
                <div className="foot px-2">
                    <div className="balance-number">{isLoading ? 'Loading...' : totalBalanceFormatted}</div>
                    <div className="balance-percent ">
                        <span className="percent-icon icon-[tabler--arrow-up-right]"></span>
                        <span className="icon-[tabler--plus]"></span>
                        <span className="percentage">0.36%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}