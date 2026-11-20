import type { store } from '../store'
import type currencyReducer from '../slices/currencySliceThunk'

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type ThunkRootState = { currency: ReturnType<typeof currencyReducer> }