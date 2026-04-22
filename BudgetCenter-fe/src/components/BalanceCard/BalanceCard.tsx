import "./BalanceCard.css";

export default function BalanceCard() {
    return (
        <div className="card card-xs sm:max-w-sm m-2">
            <div className="card-body">
                <div className="mb-2.5 px-2 head">
                    <h5 className="card-title ">Current Balance</h5>
                    <span className="balance-icon icon-[tabler--wallet]"></span>
                </div>
                <div className="foot px-2">
                    <div className="balance-number">$12,000.78</div>
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