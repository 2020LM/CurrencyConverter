import { EUR } from '../../constants/currencyNames'

export interface SelectedCurrency {
  code: string
  rate: number | null
  error: string | null
}

export type CurrencySide = 'from' | 'to'
export type RateRequest = { side: CurrencySide; code: string; requestId: string }

export interface ConversionState {
  amount: string
  result: number | null
  from: SelectedCurrency
  to: SelectedCurrency
}

export const selectCurrency = (code: string): SelectedCurrency => ({
  code,
  rate: code === EUR ? 1 : null,
  error: null,
})
