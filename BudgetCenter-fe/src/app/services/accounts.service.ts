export async function getAccounts(params? : { accessToken?: string }) {
    const url = new URL('http://localhost:8000/accounts');

    if(!params?.accessToken) {
        console.log("No access token provided.");
        return
    }
    else {
        url.searchParams.set('accessToken', params.accessToken);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
        throw new Error('Failed to fetch accounts');
    }

    return response.json();
}