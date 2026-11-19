// Internal imports
import type { ConversionState } from '../types/currencyTypes'

export const updateResult = (state: ConversionState) => {
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
