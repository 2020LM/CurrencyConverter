// Internal imports
import type { Currency } from '../../components/converter/types/converterTypes'
import { EUR } from '../../constants/currencyNames'
import { rateFailed, rateRequested, rateSucceeded, setAmount } from '../../state/slices/currencySlice'
import type { RootState } from '../../state/types/storeTypes'

// External imports
import { nanoid, type ThunkAction, type UnknownAction } from '@reduxjs/toolkit'

export const exchangeCurrency = (amount: string): ThunkAction<Promise<void>, RootState, unknown, UnknownAction> =>
    async (dispatch, getState) => {
        dispatch(setAmount(amount))
        const { from, to, currencies, requestIds } = getState().currency
        if (from.code === to.code) return

        const requestId = nanoid()
        const loadRate = async (side: 'from' | 'to'): Promise<void> => {
            const selected = side === 'from' ? from : to
            const { code, rate, error } = selected
            if (rate !== null || error !== null || requestIds[side] !== null) return
            const request = { side, code, requestId }
            dispatch(rateRequested(request))
            try {
                const currency = currencies.find((item) => item.shortName === code)
                if (!currency) throw new Error(`Unknown currency: ${code}`)
                const fetchedRate = await requestRate(currency)
                dispatch(rateSucceeded({ ...request, rate: fetchedRate }))
            } catch (error: unknown) {
                const message = error instanceof Error ? error.message : String(error)
                dispatch(rateFailed({ ...request, error: message }))
            }
        }

        await Promise.all([
            loadRate('from'),
            loadRate('to'),
        ])
    }

// Converts a value to a positive, finite exchange rate.
const positiveRate = (value: unknown): number => {
    if ((typeof value !== 'string' || value.trim() === '') && typeof value !== 'number') {
        throw new Error('Invalid exchange rate')
    }
    // Holds the numeric exchange rate after conversion.
    const rate = Number(value)
    if (!Number.isFinite(rate) || rate <= 0) {
        throw new Error('Invalid exchange rate')
    }
    return rate
}

// Parses the latest ECB observation in units of the requested currency per EUR.
const ecbRate = (xml: string, currency: string): number => {
    // Parses the ECB XML response into a document.
    const document = new DOMParser().parseFromString(xml, 'application/xml')
    if (document.getElementsByTagName('parsererror').length > 0) {
        throw new Error('Invalid ECB XML response')
    }

    for (const series of Array.from(document.getElementsByTagNameNS('*', 'Series'))) {
        // Contains the identifiers describing the current series.
        const key = series.getElementsByTagNameNS('*', 'SeriesKey')[0]
        // Identifies the currency associated with the current series.
        const code = Array.from(key?.getElementsByTagNameNS('*', 'Value') ?? [])
            .find((value) => value.getAttribute('id') === 'CURRENCY')?.getAttribute('value')
        if (code !== currency) continue

        // Reads the latest observation requested by the currency's URL.
        const observation = series.getElementsByTagNameNS('*', 'Obs')[0]
        if (!observation) throw new Error(`Missing ECB ${currency} observation`)
        // Holds the exchange rate published for the observation.
        const value = observation.getElementsByTagNameNS('*', 'ObsValue')[0]?.getAttribute('value')
        return positiveRate(value)
    }
    throw new Error(`Missing ECB ${currency} series`)
}

// Requests and returns units of the requested currency per euro.
export const requestRate = async (currency: Currency): Promise<number> => {
    if (currency.shortName === EUR) return 1

    try {
        // Holds the HTTP response from the ECB.
        const response = await fetch(currency.link)
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        return ecbRate(await response.text(), currency.shortName)
    } catch (error: unknown) {
        // Extracts a readable message even when the rejected value is not an Error.
        const message = error instanceof Error ? error.message : String(error)
        throw new Error(`Error requesting ${currency.shortName} rate: ${message}`, { cause: error })
    }
}