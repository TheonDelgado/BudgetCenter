'use client'

import { useEffect, useMemo, useState } from "react";
import "./BalanceCard.css";
import { getBalanceMonthlySummary, ingestBalanceSnapshot, type BalanceSummary } from "../../app/services/balanceSnapshots.service";
import { useAccountsContext } from "../../context/accounts-context";

function toMonthLabel(date = new Date()) {
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
}

export default function BalanceCard() {
    const { accounts, isLoading } = useAccountsContext();
    const [summary, setSummary] = useState<BalanceSummary | null>(null);

    let totalBalance = 0;
    accounts.forEach((x) => {
        totalBalance += x.balances?.current ?? 0;
    });

    const totalBalanceFormatted = totalBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

    useEffect(() => {
        const monthKey = toMonthLabel();

        async function syncAndLoadSummary() {
            try {
                await ingestBalanceSnapshot(monthKey);
            } catch {
                // Summary can still be loaded even if ingest is skipped or fails.
            }

            try {
                const nextSummary = await getBalanceMonthlySummary(monthKey);
                setSummary(nextSummary);
            } catch {
                setSummary(null);
            }
        }

        syncAndLoadSummary();
    }, []);

    const { percentFormatted, isPositive, hasComparableSnapshots } = useMemo(() => {
        const hasSnapshots = Boolean(summary?.hasCurrentSnapshot && summary?.hasPreviousSnapshot);
        if (!hasSnapshots) {
            return {
                percentFormatted: 'N/A',
                isPositive: true,
                hasComparableSnapshots: false,
            };
        }

        const percentChange = Number(summary?.percentChange) || 0;
        return {
            percentFormatted: `${Math.abs(percentChange).toFixed(2)}%`,
            isPositive: percentChange >= 0,
            hasComparableSnapshots: true,
        };
    }, [summary]);

    return (
        <div className="card card-xs sm:max-w-sm m-2">
            <div className="card-body">
                <div className="mb-2.5 px-2 head">
                    <h5 className="card-title ">Current Balance</h5>
                    <span className="balance-icon icon-[tabler--wallet]"></span>
                </div>
                <div className="foot px-2">
                    <div className="balance-number">{isLoading ? 'Loading...' : totalBalanceFormatted}</div>
                    <div className="balance-percent" style={{ color: hasComparableSnapshots ? (isPositive ? 'green' : 'red') : '#6b7280' }}>
                        {hasComparableSnapshots ? (
                            <span className={`percent-icon icon-[tabler--arrow-${isPositive ? 'up' : 'down'}-right]`}></span>
                        ) : null}
                        <span>{hasComparableSnapshots ? `${isPositive ? '+' : '-'}${percentFormatted}` : percentFormatted}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}