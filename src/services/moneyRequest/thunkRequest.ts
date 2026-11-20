// Internal imports
import { rateFailed, rateRequested, rateSucceeded, setAmount } from '../../state/slices/currencySliceThunk'
import type { ThunkRootState } from '../../state/types/storeTypes'
import { requestRate } from './rateRequest'

export { requestRate } from './rateRequest'

// External imports
import { nanoid, type ThunkAction, type UnknownAction } from '@reduxjs/toolkit'

export const exchangeCurrency = (amount: string): ThunkAction<Promise<void>, ThunkRootState, unknown, UnknownAction> =>
    async (dispatch, getState) => {
        dispatch(setAmount(amount))
        const { from, to, currencies, requestIds } = getState().currency
        if (from.code === to.code) return

        const requestId = nanoid()
        const loadRate = async (side: 'from' | 'to'): Promise<void> => {
            const selected = side === 'from' ? from : to
            const { code, rate, error } = selected
            if (rate !== null || error !== null || requestIds[side] !== null) return
            const request = { side, code, requestId }
            dispatch(rateRequested(request))
            try {
                const currency = currencies.find((item) => item.shortName === code)
                if (!currency) throw new Error(`Unknown currency: ${code}`)
                const fetchedRate = await requestRate(currency)
                dispatch(rateSucceeded({ ...request, rate: fetchedRate }))
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : String(error)
                dispatch(rateFailed({ ...request, error: message }))
            }
        }

        await Promise.all([
            loadRate('from'),
            loadRate('to'),
        ])
    }
