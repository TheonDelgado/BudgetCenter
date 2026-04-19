'use client'

import React, { useCallback, useEffect, useState } from "react"
import {
    usePlaidLink,
    PlaidLinkOptions,
    PlaidLinkOnSuccess,
    PlaidLinkOnSuccessMetadata,
    PlaidLinkOnExit,
    PlaidLinkOnExitMetadata,
    PlaidLinkError,
} from "react-plaid-link"
import "./Accounts.css"

let linkTokenRequest: Promise<string> | null = null;


export default function Accounts() {

    const [linkToken, setLinkToken] = useState<string | null>(null);

    const fetchLinkToken = async () => {
            if (!linkTokenRequest) {
                linkTokenRequest = fetch('http://localhost:8000/create-link', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                })
                    .then((response) => response.json())
                    .then((data) => data.link_token);
            }

                    return linkTokenRequest;
        };

    useEffect(() => {
        let isMounted = true;

        const loadLinkToken = async () => {
            const token = await fetchLinkToken();

            if (!isMounted) {
                return;
            }

            setLinkToken(token ?? null);
        };

        loadLinkToken();

        return () => {
            isMounted = false;
        };
    }, [])

    const onSuccess = useCallback<PlaidLinkOnSuccess>(
        (public_token: string, metadata: PlaidLinkOnSuccessMetadata) => {
            fetch('http://localhost:8000/exchange-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    public_token,
                }),
            });
        },
        [],
    );

    const onExit = useCallback<PlaidLinkOnExit>(
        (error: PlaidLinkError, metadata: PlaidLinkOnExitMetadata) => {
            // log and save error and metadata
            // handle invalid link token
            if (error != null && error.error_code === 'INVALID_LINK_TOKEN') {
                // generate new link token
            }
            // to handle other error codes, see https://plaid.com/docs/errors/
        },
        [],
    );

    const config: PlaidLinkOptions = {
        onSuccess,
        onExit,
        onEvent: (eventName, metadata) => { },
        token: linkToken,
    };

    const { open, exit, ready } = usePlaidLink(config);

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