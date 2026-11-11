// Internal imports
import currencyReducer from './slices/currencySlice'

// External imports
import { configureStore } from '@reduxjs/toolkit'
import { useSelector } from 'react-redux'

export const store = configureStore({
  reducer: { currency: currencyReducer },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppSelector = useSelector.withTypes<RootState>()
