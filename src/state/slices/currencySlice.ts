// Internal imports
import { currencyData } from '../../components/converter/data/currencyData'
import { EUR, USD } from '../../constants/currencyNames'
import { selectCurrency } from '../types/currencyTypes'
import type { ConversionState, CurrencySide, RateRequest } from '../types/currencyTypes'

// External imports
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

const updateResult = (state: ConversionState) => {
  const amount = Number(state.amount)
  if (state.amount.trim() === '' || !Number.isFinite(amount) || amount < 0) {
    state.result = null
  } else if (state.from.code === state.to.code) {
    state.result = amount
  } else if (state.from.rate !== null && state.to.rate !== null) {
    state.result = amount * state.to.rate / state.from.rate
  } else {
    state.result = null
  }
}

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
    rateRequested(state, action: PayloadAction<RateRequest>) {
      const { side, code, requestId } = action.payload
      state.requestIds[side] = requestId
      state[side].error = null
      state[side].rate = code === EUR ? 1 : null
      updateResult(state)
    },
    rateSucceeded(state, action: PayloadAction<RateRequest & { rate: number }>) {
      const { side, code, requestId, rate } = action.payload
      if (state[side].code !== code || state.requestIds[side] !== requestId) return
      state[side].rate = rate
      state[side].error = null
      state.requestIds[side] = null
      updateResult(state)
    },
    rateFailed(state, action: PayloadAction<RateRequest & { error: string }>) {
      const { side, code, requestId, error } = action.payload
      if (state[side].code !== code || state.requestIds[side] !== requestId) return
      state[side].rate = null
      state[side].error = error
      state.requestIds[side] = null
      updateResult(state)
    },
  },
})

export const { setAmount, setFrom, setTo, swapCurrencies, rateRequested, rateSucceeded, rateFailed } = currencySlice.actions
export default currencySlice.reducer
