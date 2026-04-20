import React from "react";
import "./BalanceCard.css";

export default function BalanceCard() {
    return (
        <div className="card card-xs sm:max-w-sm m-2">
            <div className="card-body">
                <div className="head">
                    <h5 className="card-title mb-2.5">Current Balance</h5>
                    {/* Insert Icon Here */}
                </div>
                <div className="foot">
                    <div className="mb-4">$12,000</div>
                    <div className="mb-4">36%</div>
                </div>
            </div>
        </div>
    );
}