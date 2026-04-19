export async function getAccounts() {
    const response = await fetch('http://localhost:8000/accounts');

    if (!response.ok) {
        throw new Error('Failed to fetch accounts');
    }

    return response.json();
}