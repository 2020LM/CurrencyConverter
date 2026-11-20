// Internal imports
import { currencyData } from '../../components/converter/data/currencyData'
import { EUR, USD } from '../../constants/currencyNames'

// External imports
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

const currencySlice = createSlice({
  name: 'currency',
  initialState: {
    currencies: currencyData,
    from: { code: USD },
    to: { code: EUR },
    amount: '2',
  },
  reducers: {
    setAmount(state, action: PayloadAction<string>) {
      state.amount = action.payload
    },
    setFrom(state, action: PayloadAction<string>) {
      state.from.code = action.payload
    },
    setTo(state, action: PayloadAction<string>) {
      state.to.code = action.payload
    },
    swapCurrencies(state) {
      const previousFrom = state.from
      state.from = state.to
      state.to = previousFrom
    },
  },
})

export const { setAmount, setFrom, setTo, swapCurrencies } = currencySlice.actions
export default currencySlice.reducer
