export type Budget = {
    id: number,
    userId: number,
    name: string,
    category: string,
    amount: number | string,
    month: string,
    type: string,
    createdAt: Date,
    updatedAt: Date 
}