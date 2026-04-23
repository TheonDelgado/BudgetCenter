'use client'

import { useCallback, useEffect, useState } from "react"
import {
    PlaidLinkError,
    PlaidLinkOnExit,
    PlaidLinkOnExitMetadata,
    PlaidLinkOnSuccess,
    PlaidLinkOnSuccessMetadata,
    usePlaidLink,
} from "react-plaid-link"
import { exchangePublicToken, fetchLinkToken, resetLinkTokenRequest } from "../services/link.service"
import { useAccountsContext } from "../../context/accounts-context"
import "./accounts.css"

function PlaidLinkReadyState({
    linkToken,
    onLinkSuccess,
    onLinkExit,
}: {
    linkToken: string;
    onLinkSuccess: PlaidLinkOnSuccess;
    onLinkExit: PlaidLinkOnExit;
}) {
    const { open, ready } = usePlaidLink({
        token: linkToken,
        onSuccess: onLinkSuccess,
        onExit: onLinkExit,
        onEvent: () => { },
    });

    return (
        <>
            <div className="top-header">
                <h1 className="main-header">Manage Your Accounts</h1>
                <button className="btn btn-info add-account-button" onClick={() => open()} disabled={!ready}>
                    <span className="icon-[tabler--plus-filled]"></span>
                    <span>Add New Account</span>
                </button>
            </div>

            <div className="bottom-header pt-4">
                <button className="btn btn-info add-account-button" onClick={() => open()} disabled={!ready}>
                    <span className="icon-[tabler--plus-filled]"></span>
                    <span>Add New Account</span>
                </button>
                <input type="text" placeholder="Search for Account" className="input max-w-sm search-box" />
            </div>
        </>
    )
}

export default function Accounts() {
    const { accounts, isLoading, error: accountsError, refreshAccounts } = useAccountsContext();

    const [linkToken, setLinkToken] = useState<string | null>(null);
    const [linkError, setLinkError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadLinkToken = async () => {
            try {
                const token = await fetchLinkToken();

                if (!isMounted) {
                    return;
                }

                setLinkToken(token ?? null);
                setLinkError(null);
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                const message = error instanceof Error ? error.message : 'Failed to load link token';
                setLinkError(message);
            }
        };

        loadLinkToken();

        return () => {
            isMounted = false;
        };
    }, [])

    const onSuccess = useCallback<PlaidLinkOnSuccess>(
        async (publicToken: string, metadata: PlaidLinkOnSuccessMetadata) => {
            try {
                await exchangePublicToken(publicToken);
                await refreshAccounts();
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to exchange public token';
                setLinkError(message);
            }
        },
        [refreshAccounts],
    );

    const onExit = useCallback<PlaidLinkOnExit>(
       async (error: PlaidLinkError | null, metadata: PlaidLinkOnExitMetadata) => {
            if (error?.error_code === 'INVALID_LINK_TOKEN') {
                resetLinkTokenRequest();
                setLinkToken(null);
            }
        },
        [],
    );

    return (
        <div className="accounts">

            <h4 className="welcome-text">Welcome User</h4>

            {linkError ? <div className="alert alert-soft alert-error my-4">{linkError}</div> : null}
            {!linkError && accountsError ? <div className="alert alert-soft alert-warning my-4">{accountsError}</div> : null}

            {linkToken ? <PlaidLinkReadyState linkToken={linkToken} onLinkSuccess={onSuccess} onLinkExit={onExit} /> : <>
                <div className="top-header">
                    <h1 className="main-header">Manage Your Accounts</h1>
                    <button className="btn btn-info add-account-button" disabled>
                        <span className="icon-[tabler--plus-filled]"></span>
                        <span>Add New Account</span>
                    </button>
                </div>

                <div className="bottom-header pt-4">
                    <button className="btn btn-info add-account-button" disabled>
                        <span className="icon-[tabler--plus-filled]"></span>
                        <span>Add New Account</span>
                    </button>
                    <input type="text" placeholder="Search for Account" className="input max-w-sm search-box" />
                </div>
            </>}

            <div className="w-full overflow-x-auto py-6 px-2">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Account Name</th>
                            <th>Institution</th>
                            <th>Account Type</th>
                            <th>Current Balance</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? <tr>
                            <td colSpan={6}>Loading accounts...</td>
                        </tr> : null}

                        {!isLoading && accounts.length === 0 ? <tr>
                            <td colSpan={6}>No accounts linked yet.</td>
                        </tr> : null}

                        {!isLoading ? accounts.map((account) => {
                            const currentBalance = account.balances?.current;
                            const currency = account.balances?.iso_currency_code ?? account.balances?.unofficial_currency_code ?? 'USD';
                            
                            const accountSubtype = account.subtype.charAt(0).toUpperCase() + account.subtype.slice(1);
                            const accountType = account.type.charAt(0).toUpperCase() + account.type.slice(1);

                            return (
                                <tr className="row-hover" key={account.account_id}>
                                    <td>{account.name}</td>
                                    <td>{ account.institutionName ?? 'Linked institution'}</td>
                                    <td><span className="badge badge-soft text-xs" style={{ color: "white", background: "#27d87a" }}>{accountSubtype ?? accountType}</span></td>
                                    <td>{typeof currentBalance === 'number' ? new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(currentBalance) : 'Unavailable'}</td>
                                    <td>Linked</td>
                                    <td>
                                        <button className="btn btn-circle btn-text btn-sm" aria-label="View account options"><span className="icon-[tabler--dots-vertical] size-5"></span></button>
                                    </td>
                                </tr>
                            );
                        }) : null}
                    </tbody>
                </table>
            </div>
        </div>
    )
}