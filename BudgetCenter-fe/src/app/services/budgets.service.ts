import type { Budget } from '../../types/budget';

export async function createBudgetItem(
    name: string,
    amount: number,
    periodStart: string,
    periodEnd: string,
): Promise<Budget> {
    const response = await fetch('http://localhost:8000/create-budget', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, amount, periodStart, periodEnd }),
    });

    if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        const message = errorPayload?.error ?? 'Failed to create budget';
        throw new Error(message);
    }

    return response.json();
}