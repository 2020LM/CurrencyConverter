// Internal imports

// Thunk implementation
// import currencyReducer from './slices/currencySliceThunk'

// CreateAsynkThunk implementation
import currencyReducer from './slices/currencySliceAsyncThunk'


import type { RootState } from './types/storeTypes'

// External imports
import { configureStore } from '@reduxjs/toolkit'
import { useSelector } from 'react-redux'

export const store = configureStore({
  reducer: { currency: currencyReducer },
})

export type { RootState, AppDispatch } from './types/storeTypes'

export const useAppSelector = useSelector.withTypes<RootState>()
