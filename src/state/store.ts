// Internal imports

import currencyReducer from './slices/currencySliceRTKQuery'
import { currencyApi } from '../services/moneyRequest/RTKQuery'

import type { RootState } from './types/storeTypes'

// External imports
import { configureStore } from '@reduxjs/toolkit'
import { useSelector } from 'react-redux'

export const store = configureStore({
  reducer: {
    currency: currencyReducer,
    [currencyApi.reducerPath]: currencyApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(currencyApi.middleware),
})

export type { RootState, AppDispatch } from './types/storeTypes'

export const useAppSelector = useSelector.withTypes<RootState>()
