export type Budget = {
    id: number,
    userId: number,
    name: string,
    amount: number,
    periodStart: string,
    periodEnd: string,
    type: string,
    createdAt: Date,
    updatedAt: Date 
}