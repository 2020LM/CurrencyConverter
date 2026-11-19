// Internal imports
import { currencyData } from '../../components/converter/data/currencyData'
import { EUR, USD } from '../../constants/currencyNames'
import { fetchCurrencyRate } from '../../services/moneyRequest/createasyncthunk'
import { selectCurrency } from '../types/currencyTypes'
import type { CurrencySide } from '../types/currencyTypes'
import type { RootState } from '../types/storeTypes'
import { updateResult } from './updateResult'

// External imports
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction, ThunkAction, UnknownAction } from '@reduxjs/toolkit'

const currencySlice = createSlice({
  name: 'currency',
  initialState: {
    currencies: currencyData,
    from: selectCurrency(USD),
    to: selectCurrency(EUR),
    amount: '2',
    result: null as number | null,
    requestIds: { from: null, to: null } as Record<CurrencySide, string | null>,
  },
  reducers: {
    setAmount(state, action: PayloadAction<string>) {
      state.amount = action.payload
      updateResult(state)
    },
    setFrom(state, action: PayloadAction<string>) {
      if (state.from.code !== action.payload) {
        state.from = selectCurrency(action.payload)
        state.requestIds.from = null
        updateResult(state)
      }
    },
    setTo(state, action: PayloadAction<string>) {
      if (state.to.code !== action.payload) {
        state.to = selectCurrency(action.payload)
        state.requestIds.to = null
        updateResult(state)
      }
    },
    swapCurrencies(state) {
      const previousFrom = state.from
      state.from = state.to
      state.to = previousFrom
      state.requestIds.from = null
      state.requestIds.to = null
      updateResult(state)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrencyRate.pending, (state, action) => {
        const { side, code } = action.meta.arg
        if (state[side].code !== code) return
        state.requestIds[side] = action.meta.requestId
        state[side].error = null
        state[side].rate = null
        updateResult(state)
      })
      .addCase(fetchCurrencyRate.fulfilled, (state, action) => {
        const { side, code } = action.meta.arg
        if (state[side].code !== code || state.requestIds[side] !== action.meta.requestId) return
        state[side].rate = action.payload
        state[side].error = null
        state.requestIds[side] = null
        updateResult(state)
      })
      .addCase(fetchCurrencyRate.rejected, (state, action) => {
        const { side, code } = action.meta.arg
        if (state[side].code !== code || state.requestIds[side] !== action.meta.requestId) return
        state[side].rate = null
        state[side].error = action.payload ?? action.error.message ?? 'Exchange rate request failed'
        state.requestIds[side] = null
        updateResult(state)
      })
  },
})

export const { setAmount, setFrom, setTo, swapCurrencies } = currencySlice.actions

export const exchangeCurrency = (amount: string): ThunkAction<Promise<void>, RootState, unknown, UnknownAction> =>
  async (dispatch, getState) => {
    dispatch(setAmount(amount))
    const { from, to } = getState().currency
    if (from.code === to.code) return

    await Promise.all([
      dispatch(fetchCurrencyRate({ side: 'from', code: from.code })),
      dispatch(fetchCurrencyRate({ side: 'to', code: to.code })),
    ])
  }

export default currencySlice.reducer