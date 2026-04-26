import type { SavingsGoal, SavingsSummary, SavingsTrendPoint } from '../../types/savings'

const BASE_URL = 'http://localhost:8000'

export async function upsertSavingsGoal(monthKey: string, amount: number): Promise<SavingsGoal> {
    const response = await fetch(`${BASE_URL}/savings-goals`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ month: monthKey, amount }),
    })

    if (!response.ok) {
        const errorPayload = await response.json().catch(() => null)
        const message = errorPayload?.error ?? 'Failed to save savings goal'
        throw new Error(message)
    }

    return response.json()
}

export async function ingestSavingsSnapshot(monthKey: string) {
    const query = new URLSearchParams({ monthKey })
    const response = await fetch(`${BASE_URL}/savings-snapshots/ingest?${query.toString()}`, {
        method: 'POST',
    })

    if (!response.ok) {
        const errorPayload = await response.json().catch(() => null)
        const message = errorPayload?.error ?? 'Failed to ingest savings snapshot'
        throw new Error(message)
    }

    return response.json()
}

export async function getSavingsMonthlySummary(monthKey: string): Promise<SavingsSummary> {
    const query = new URLSearchParams({ monthKey })
    const response = await fetch(`${BASE_URL}/savings-summary?${query.toString()}`)

    if (!response.ok) {
        const errorPayload = await response.json().catch(() => null)
        const message = errorPayload?.error ?? 'Failed to load savings summary'
        throw new Error(message)
    }

    return response.json()
}

export async function getSavingsTrend(months = 6): Promise<SavingsTrendPoint[]> {
    const query = new URLSearchParams({ months: String(months) })
    const response = await fetch(`${BASE_URL}/savings-trend?${query.toString()}`)

    if (!response.ok) {
        const errorPayload = await response.json().catch(() => null)
        const message = errorPayload?.error ?? 'Failed to load savings trend'
        throw new Error(message)
    }

    return response.json()
}
