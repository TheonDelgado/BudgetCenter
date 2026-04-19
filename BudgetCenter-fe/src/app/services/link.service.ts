let linkTokenRequest: Promise<string> | null = null;

export async function fetchLinkToken(): Promise<string> {
    if (!linkTokenRequest) {
        linkTokenRequest = fetch('http://localhost:8000/create-link', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(async (response) => {
                if (!response.ok) {
                    const errorPayload = await response.json().catch(() => null);
                    const message = errorPayload?.error ?? 'Failed to fetch link token';
                    throw new Error(message);
                }

                return response.json();
            })
            .then((data) => data.link_token)
            .catch((error) => {
                linkTokenRequest = null;
                throw error;
            });
    }

    return linkTokenRequest;
}

export async function exchangePublicToken(publicToken: string) {
    const response = await fetch('http://localhost:8000/exchange-token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            public_token: publicToken,
        }),
    });

    if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        const message = errorPayload?.error ?? 'Failed to exchange public token';
        throw new Error(message);
    }

    return response.json();
}

export function resetLinkTokenRequest() {
    linkTokenRequest = null;
}