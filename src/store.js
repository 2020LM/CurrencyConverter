import { configureStore, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { createApi } from '@reduxjs/toolkit/query/react';
import { errorMessage, fetchRates } from './rates.js';

const initialState = { data: null, status: 'idle', error: null };

const thunkSlice = createSlice({
  name: 'thunkRates',
  initialState,
  reducers: {
    requested(state) {
      state.status = 'loading';
      state.error = null;
      state.data = null;
    },
    received(state, action) {
      state.status = 'succeeded';
      state.data = action.payload;
    },
    failed(state, action) {
      state.status = 'failed';
      state.error = action.payload;
    },
  },
});

export const loadRates = (base) => async (dispatch) => {
  dispatch(thunkSlice.actions.requested());
  try {
    dispatch(thunkSlice.actions.received(await fetchRates(base)));
  } catch (error) {
    dispatch(thunkSlice.actions.failed(errorMessage(error)));
  }
};

export const loadRatesAsync = createAsyncThunk('asyncRates/load', fetchRates);

const asyncSlice = createSlice({
  name: 'asyncRates',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadRatesAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.data = null;
      })
      .addCase(loadRatesAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(loadRatesAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = errorMessage(action.error);
      });
  },
});

export const ratesApi = createApi({
  reducerPath: 'ratesApi',
  baseQuery: async (base) => {
    try {
      return { data: await fetchRates(base) };
    } catch (error) {
      return { error: { status: 'CUSTOM_ERROR', error: errorMessage(error) } };
    }
  },
  endpoints: (builder) => ({
    getRates: builder.query({ query: (base) => base }),
  }),
});

export function makeStore() {
  return configureStore({
    reducer: {
      thunkRates: thunkSlice.reducer,
      asyncRates: asyncSlice.reducer,
      [ratesApi.reducerPath]: ratesApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(ratesApi.middleware),
  });
}
