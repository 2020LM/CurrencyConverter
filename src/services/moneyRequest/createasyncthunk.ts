// Internal imports
import type { CurrencySide } from '../../state/types/currencyTypes'
import type { ThunkRootState } from '../../state/types/storeTypes'
import { requestRate } from './rateRequest'

// External imports
import { createAsyncThunk } from '@reduxjs/toolkit'

export const fetchCurrencyRate = createAsyncThunk<
    number,
    { side: CurrencySide; code: string },
    { state: ThunkRootState; rejectValue: string }
>(
    'currency/fetchCurrencyRate',
    async ({ code }, { getState, rejectWithValue }) => {
        try {
            const currency = getState().currency.currencies.find((item) => item.shortName === code)
            if (!currency) throw new Error(`Unknown currency: ${code}`)
            return await requestRate(currency)
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : String(error))
        }
    },
    {
        condition: ({ side, code }, { getState }) => {
            const { from, to, requestIds } = getState().currency
            const selected = side === 'from' ? from : to
            return from.code !== to.code && selected.code === code
                && selected.rate === null && selected.error === null && requestIds[side] === null
        },
    },
)