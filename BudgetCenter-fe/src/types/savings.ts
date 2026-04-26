export type SavingsGoal = {
    id: number
    userId: number
    monthKey: string
    targetAmount: number
    createdAt: string
    updatedAt: string
}

export type SavingsSummary = {
    monthKey: string
    targetAmount: number
    savedAmount: number
    percent: number
    remainingDelta: number
    lastCapturedAt: string | null
}

export type SavingsTrendPoint = {
    monthKey: string
    targetAmount: number
    savedAmount: number
    percent: number
}
