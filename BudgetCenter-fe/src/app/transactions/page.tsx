'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTransactionsContext } from '../../context/transactions-context'
import './transactions.css'
import { DEFAULT_BUDGET_CATEGORY } from '../../utils/budgetCategoryMap'

export default function Transactions() {
    const { transactions, isLoading, error, refreshTransactions } = useTransactionsContext()
    const [searchTerm, setSearchTerm] = useState('')
    const [loadedTransactions, setLoadedTransactions] = useState(transactions);

    const filteredTransactions = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase()

        if (!normalizedSearch) {
            return transactions
        }

        return transactions.filter((transaction) => {
            const merchant = (transaction.merchant_name ?? '').toLowerCase()
            const name = (transaction.name ?? '').toLowerCase()
            const institution = (transaction.institutionName ?? '').toLowerCase()
            return merchant.includes(normalizedSearch)
                || name.includes(normalizedSearch)
                || institution.includes(normalizedSearch)
        })
    }, [searchTerm, transactions])

    useEffect(() =>{
        refreshTransactions();
    }, [])

    return (
        <div className='transactions-page'>
            <h4 className='welcome-text'>Welcome User</h4>

            <div className='top-header'>
                <h1 className='main-header'>Recent Transactions</h1>
                <button className='btn btn-info refresh-button' onClick={() => refreshTransactions()}>
                    <span className='icon-[tabler--refresh]'></span>
                    <span>Refresh</span>
                </button>
            </div>

            <div className='bottom-header pt-4'>
                <div className='text-sm text-gray-500'>Showing last 90 days from connected institutions</div>
                <input
                    type='text'
                    placeholder='Search transactions'
                    className='input max-w-sm search-box'
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                />
            </div>

            {error ? <div className='alert alert-soft alert-error mt-4'>{error}</div> : null}

            <div className='w-full overflow-x-auto py-6 px-2'>
                <table className='table'>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Institution</th>
                            <th>Status</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={6}>Loading transactions...</td>
                            </tr>
                        ) : null}

                        {!isLoading && filteredTransactions.length === 0 ? (
                            <tr>
                                <td colSpan={6}>No transactions found.</td>
                            </tr>
                        ) : null}

                        {!isLoading
                            ? filteredTransactions.map((transaction) => {
                                const currencyCode = transaction.iso_currency_code
                                    ?? transaction.unofficial_currency_code
                                    ?? 'USD'
                                const description = transaction.merchant_name
                                    ?? transaction.name
                                    ?? 'Transaction'
                                const categoryName = transaction.budgetCategoryName ?? DEFAULT_BUDGET_CATEGORY

                                return (
                                    <tr className='row-hover' key={transaction.transaction_id}>
                                        <td>{transaction.authorized_date ?? transaction.date}</td>
                                        <td>{description}</td>
                                        <td>{categoryName}</td>
                                        <td>{transaction.institutionName ?? 'Linked institution'}</td>
                                        <td>
                                            <span className={`badge badge-soft text-xs ${transaction.pending ? 'pending-badge' : 'posted-badge'}`}>
                                                {transaction.pending ? 'Pending' : 'Posted'}
                                            </span>
                                        </td>
                                        <td>
                                            {new Intl.NumberFormat('en-US', {
                                                style: 'currency',
                                                currency: currencyCode,
                                            }).format(transaction.amount)}
                                        </td>
                                    </tr>
                                )
                            })
                            : null}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
