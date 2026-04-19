'use client'

import React, { useCallback, useEffect, useState } from "react"
import {
    PlaidLinkError,
    PlaidLinkOnExit,
    PlaidLinkOnExitMetadata,
    PlaidLinkOnSuccess,
    PlaidLinkOnSuccessMetadata,
    usePlaidLink,
} from "react-plaid-link"
import { exchangePublicToken, fetchLinkToken, resetLinkTokenRequest } from "../services/link.service"
import { getAccounts } from "../services/accounts.service"
import "./Accounts.css"


export default function Accounts() {

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
                const response = await exchangePublicToken(publicToken);
                const accessToken = response.accessToken;

                if (!localStorage.getItem("accessToken")) {
                    localStorage.setItem("accessToken", accessToken);
                }

            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to exchange public token';
                setLinkError(message);
            }

            const accounts = await getAccounts({accessToken: localStorage.getItem("accessToken")});
            console.log(accounts);
        },
        [],
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

    const { open, ready } = usePlaidLink({
        token: linkToken,
        onSuccess,
        onExit,
        onEvent: () => { },
    });

    return (
        <div className="accounts">

            <h4 className="welcome-text">Welcome User</h4>

            <div className="top-header">
                <h1 className="main-header">Manage Your Accounts</h1>
                <button className="btn btn-info add-account-button" onClick={() => open()} disabled={!ready || !linkToken}>
                    <span className="icon-[tabler--plus-filled]"></span>
                    <span>Add New Account</span>
                </button>
            </div>

            {linkError ? <p>{linkError}</p> : null}

            <div className="bottom-header pt-4">
                <button className="btn btn-info add-account-button" onClick={() => open()} disabled={!ready || !linkToken}>
                    <span className="icon-[tabler--plus-filled]"></span>
                    <span>Add New Account</span>
                </button>
                <input type="text" placeholder="Search for Account" className="input max-w-sm search-box" />
            </div>

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
                        <tr className="row-hover">
                            <td>John Doe</td>
                            <td>johndoe@example.com</td>
                            <td><span className="badge badge-soft text-xs" style={{ color: "white", background: "#27d87a" }}>Checking</span></td>
                            <td>March 1, 2024</td>
                            <td>
                                <button className="btn btn-circle btn-text btn-sm" aria-label="Action button"><span className="icon-[tabler--pencil] size-5"></span></button>
                                <button className="btn btn-circle btn-text btn-sm" aria-label="Action button"><span className="icon-[tabler--trash] size-5"></span></button>
                                <button className="btn btn-circle btn-text btn-sm" aria-label="Action button"><span className="icon-[tabler--dots-vertical] size-5"></span></button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}