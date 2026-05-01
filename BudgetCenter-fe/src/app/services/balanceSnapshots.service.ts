const BASE_URL = 'http://localhost:8000'

export type BalanceSummary = {
    monthKey: string
    previousMonthKey: string | null
    currentBalance: number
    previousBalance: number
    changeAmount: number
    percentChange: number
    hasCurrentSnapshot: boolean
    hasPreviousSnapshot: boolean
    lastCapturedAt: string | null
}

export async function ingestBalanceSnapshot(monthKey: string) {
    const query = new URLSearchParams({ monthKey })
    const response = await fetch(`${BASE_URL}/balance-snapshots/ingest?${query.toString()}`, {
        method: 'POST',
    })

    if (!response.ok) {
        const errorPayload = await response.json().catch(() => null)
        const message = errorPayload?.error ?? 'Failed to ingest balance snapshot'
        throw new Error(message)
    }

    return response.json()
}

export async function getBalanceMonthlySummary(monthKey: string): Promise<BalanceSummary> {
    const query = new URLSearchParams({ monthKey })
    const response = await fetch(`${BASE_URL}/balance-summary?${query.toString()}`)

    if (!response.ok) {
        const errorPayload = await response.json().catch(() => null)
        const message = errorPayload?.error ?? 'Failed to load balance summary'
        throw new Error(message)
    }

    return response.json()
}
