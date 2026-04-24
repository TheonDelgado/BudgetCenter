import type { Transaction } from '../../types/transaction'

export async function getTransactions(): Promise<Transaction[]> {
    const response = await fetch('http://localhost:8000/transactions')

    if (!response.ok) {
        const errorPayload = await response.json().catch(() => null)
        const message = errorPayload?.error ?? 'Failed to fetch transactions'
        throw new Error(message)
    }

    return response.json()
}
