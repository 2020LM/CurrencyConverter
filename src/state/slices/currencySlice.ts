// Internal imports
import { currencyData } from '../../components/converter/data/currencyData'

// External imports
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

const currencySlice = createSlice({
  name: 'currency',
  initialState: {
    currencies: currencyData,
    from: 'USD',
    to: 'EUR',
  },
  reducers: {
    setFrom(state, action: PayloadAction<string>) {
      state.from = action.payload
    },
    setTo(state, action: PayloadAction<string>) {
      state.to = action.payload
    },
    swapCurrencies(state) {
      const previousFrom = state.from
      state.from = state.to
      state.to = previousFrom
    },
  },
})

export const { setFrom, setTo, swapCurrencies } = currencySlice.actions
export default currencySlice.reducer
