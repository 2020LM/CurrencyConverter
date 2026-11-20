// Internal imports

// Thunk implementation
// import currencyReducer from './slices/currencySliceThunk'

// CreateAsynkThunk implementation
//import currencyReducer from './slices/currencySliceAsyncThunk'

// RTK Query implementation
import currencyReducer from './slices/currencySliceRTKQuery'
import { currencyApi } from '../services/moneyRequest/RTKQuery'

import type { RootState } from './types/storeTypes'

// External imports
import { configureStore } from '@reduxjs/toolkit'
import { useSelector } from 'react-redux'

export const store = configureStore({
  reducer: {
    currency: currencyReducer,
    // RTK Query implementation
    [currencyApi.reducerPath]: currencyApi.reducer,
  },
  // RTK Query implementation
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(currencyApi.middleware),
})

export type { RootState, AppDispatch } from './types/storeTypes'

export const useAppSelector = useSelector.withTypes<RootState>()
