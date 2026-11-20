// Internal imports
import { currencyData } from '../../components/converter/data/currencyData'
import { requestRate } from './rateRequest'

// External imports
import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'

export const currencyApi = createApi({
  reducerPath: 'currencyApi',
  baseQuery: fakeBaseQuery<string>(),
  endpoints: (builder) => ({
    getRate: builder.query<number, string>({
      async queryFn(code) {
        const currency = currencyData.find((item) => item.shortName === code)
        if (!currency) return { error: `Unknown currency: ${code}` }

        try {
          return { data: await requestRate(currency) }
        } catch (error: unknown) {
          return { error: error instanceof Error ? error.message : String(error) }
        }
      },
    }),
  }),
})

export const { useGetRateQuery } = currencyApi