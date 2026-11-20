// Internal imports
import { setAmount } from '../../state/slices/currencySliceAsyncThunk'
import type { ThunkRootState } from '../../state/types/storeTypes'
import { fetchCurrencyRate } from './createasyncthunk'

// External imports
import type { ThunkAction, UnknownAction } from '@reduxjs/toolkit'

export const exchangeCurrency = (amount: string): ThunkAction<Promise<void>, ThunkRootState, unknown, UnknownAction> =>
  async (dispatch, getState) => {
    dispatch(setAmount(amount))
    const { from, to } = getState().currency
    if (from.code === to.code) return

    await Promise.all([
      dispatch(fetchCurrencyRate({ side: 'from', code: from.code })),
      dispatch(fetchCurrencyRate({ side: 'to', code: to.code })),
    ])
  }
