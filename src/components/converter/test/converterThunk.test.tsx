// Internal imports
import Converter from '../view/converter.tsx'

// Thunk Implementation
//import currencyReducer, { setAmount, setFrom, setTo } from '../../../state/slices/currencySliceThunk'

// CreateAsyncThunk Implementation
import currencyReducer, { setAmount, setFrom, setTo } from '../../../state/slices/currencySliceAsyncThunk'

// External imports
import { configureStore } from '@reduxjs/toolkit'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { Provider } from 'react-redux'
import '@testing-library/jest-dom'

type MockResponse = Pick<Response, 'ok' | 'text'>

// Keep the currency data while giving each flag a distinct test path.
jest.mock('../data/currencyData', () => {
 const actual = jest.requireActual<typeof import('../data/currencyData')>('../data/currencyData')
 return {
  currencyData: actual.currencyData.map((currency) => ({
   ...currency,
   src: `${currency.shortName}-flag.svg`,
  })),
 }
})

const originalFetch = globalThis.fetch
let fetchMock: jest.Mock<Promise<MockResponse>, [RequestInfo | URL, RequestInit?]>

function mockRates(failingCode?: string) {
 const rates: Record<string, string> = { USD: '1.11', SGD: '1.42' }
 fetchMock.mockImplementation(async (url) => {
  const code = Object.keys(rates).find((currency) => String(url).includes(`.${currency}.`))
  if (!code) throw new Error(`Unexpected request: ${url}`)
  if (code === failingCode) throw new Error('Server unavailable')
  return {
   ok: true,
   text: async () => `<DataSet><Series><SeriesKey><Value id="CURRENCY" value="${code}"/></SeriesKey><Obs><ObsValue value="${rates[code]}"/></Obs></Series></DataSet>`,
  }
 })
}

beforeEach(() => {
 fetchMock = jest.fn()
 globalThis.fetch = (...args) => fetchMock(...args) as Promise<Response>
 mockRates()
})

afterEach(() => {
 globalThis.fetch = originalFetch
})

function renderConverter() {
 const store = configureStore({ reducer: { currency: currencyReducer } })
 render(<Provider store={store}><Converter /></Provider>)
}

test('renders Converter component', async () => {
 renderConverter()

 // To check the existance of all the elements in the component.
 expect(screen.getAllByRole('spinbutton')).toHaveLength(1)
 expect(screen.getAllByRole('combobox')).toHaveLength(2)
 expect(screen.getAllByRole('paragraph')).toHaveLength(4)
 expect(screen.getAllByRole('button')).toHaveLength(1)

 // To check the text content of the elements.
 expect(screen.getByRole('spinbutton', { name: RegExp('Amount','i')})).toBeInTheDocument()
 expect(screen.getByRole('combobox', { name: RegExp('From','i')})).toBeInTheDocument()
 expect(screen.getByRole('combobox', { name: RegExp('To','i')})).toBeInTheDocument()
 await screen.findByText('2 USD = 1.80 EUR')
})

test('shows twelve currencies in both selectors and converts the initial amount', async () => {
 renderConverter()

 const from = screen.getByRole('combobox', { name: RegExp('from', 'i') })
 const to = screen.getByRole('combobox', { name: RegExp('to', 'i') })
 const codes = ['USD', 'SGD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'MXN', 'BRL']

 for (const selector of [from, to]) {
  expect(within(selector).getAllByRole('option')).toHaveLength(12)
  for (const code of codes) {
   expect(within(selector).getByRole('option', {
    name: new RegExp(`^${code} - .+ \\(.+\\)$`),
   })).toBeInTheDocument()
  }
 }

 expect(from).toHaveValue('USD')
 expect(to).toHaveValue('EUR')
 expect(await screen.findByText('1.80€')).toBeInTheDocument()
 expect(within(screen.getByText('From', { selector: 'label' })).getByRole('presentation')).toHaveAttribute('src', 'USD-flag.svg')
 expect(within(screen.getByText('To', { selector: 'label' })).getByRole('presentation')).toHaveAttribute('src', 'EUR-flag.svg')
 expect(screen.getByText('2 USD = 1.80 EUR')).toBeInTheDocument()
 expect(screen.getByText('1 USD = 0.90 EUR')).toBeInTheDocument()
})

test('does not display a numeric result for invalid or empty amounts', async () => {
 renderConverter()
 await screen.findByText('2 USD = 1.80 EUR')
 const amount = screen.getByRole('spinbutton', { name: RegExp('amount', 'i') })
 for (const value of ['-5', '']) {
  fireEvent.change(amount, { target: { value } })
  expect(screen.getByText('—')).toBeInTheDocument()
 }
})

test('converts a decimal amount', async () => {
 renderConverter()
 await screen.findByText('2 USD = 1.80 EUR')
 fireEvent.change(screen.getByRole('spinbutton', { name: RegExp('amount', 'i') }), { target: { value: '2.5' } })
 expect(screen.getByText('2.5 USD = 2.25 EUR')).toBeInTheDocument()
})

describe('currency conversion with the API', () => {
 function renderApiConverter(from: string, to: string) {
  const store = configureStore({ reducer: { currency: currencyReducer } })
  store.dispatch(setFrom(from))
  store.dispatch(setTo(to))
  store.dispatch(setAmount('1'))
  render(<Provider store={store}><Converter /></Provider>)
 }

  test('shows loading while waiting for the exchange rate', async () => {
   let resolveResponse!: (response: MockResponse) => void
   fetchMock.mockImplementation(() => new Promise((resolve) => { resolveResponse = resolve }))

   // Keep the USD response pending while checking the loading message.
   renderApiConverter('USD', 'EUR')
   expect(fetchMock).toHaveBeenCalledTimes(1)
   expect(screen.getByText(RegExp('loading', 'i'))).toBeInTheDocument()

   // Complete the request and check that loading disappears.
   resolveResponse({
    ok: true,
    text: async () => '<DataSet><Series><SeriesKey><Value id="CURRENCY" value="USD"/></SeriesKey><Obs><ObsValue value="1.11"/></Obs></Series></DataSet>',
   })
   expect((await screen.findAllByText('1 USD = 0.90 EUR')).length).toBeGreaterThan(0)
   expect(screen.queryByText(RegExp('loading', 'i'))).not.toBeInTheDocument()
  })

 test('keeps loading until both currency requests finish', async () => {
  const responses: Record<string, (response: MockResponse) => void> = {}
  fetchMock.mockImplementation((url) => new Promise((resolve) => {
   const code = ['USD', 'SGD'].find((currency) => String(url).includes(`.${currency}.`))
   if (!code) throw new Error(`Unexpected request: ${url}`)
   responses[code] = resolve
  }))

  // Request the From and To exchange rates at the same time.
  renderApiConverter('USD', 'SGD')
  expect(fetchMock).toHaveBeenCalledTimes(2)
  expect(screen.getByRole('status')).toHaveTextContent('Loading')

  // Complete the USD request while the SGD request remains pending.
  await act(async () => {
   responses.USD({
    ok: true,
    text: async () => '<DataSet><Series><SeriesKey><Value id="CURRENCY" value="USD"/></SeriesKey><Obs><ObsValue value="1.11"/></Obs></Series></DataSet>',
   })
  })
  expect(screen.getByRole('status')).toHaveTextContent('Loading')

  // Complete the SGD request and check the conversion.
  await act(async () => {
   responses.SGD({
    ok: true,
    text: async () => '<DataSet><Series><SeriesKey><Value id="CURRENCY" value="SGD"/></SeriesKey><Obs><ObsValue value="1.42"/></Obs></Series></DataSet>',
   })
  })
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  expect(screen.getAllByText('1 USD = 1.28 SGD').length).toBeGreaterThan(0)
 })

 test('stops showing loading when both currencies become the same', async () => {
  let resolveResponse!: (response: MockResponse) => void
  fetchMock.mockImplementation(() => new Promise((resolve) => { resolveResponse = resolve }))
  renderApiConverter('USD', 'EUR')
  expect(screen.getByRole('status')).toHaveTextContent('Loading')

  // Select USD as the To currency while the From request is pending.
  fireEvent.change(screen.getByRole('combobox', { name: RegExp('to', 'i') }), { target: { value: 'USD' } })
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  expect(screen.getAllByText('1 USD = 1.00 USD').length).toBeGreaterThan(0)

  // Complete the earlier request and keep the same-currency result.
  await act(async () => {
   resolveResponse({
    ok: true,
    text: async () => '<DataSet><Series><SeriesKey><Value id="CURRENCY" value="USD"/></SeriesKey><Obs><ObsValue value="1.11"/></Obs></Series></DataSet>',
   })
  })
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  expect(screen.getAllByText('1 USD = 1.00 USD').length).toBeGreaterThan(0)
 })

 describe('From is EUR', () => {
  test('shows the same amount when To is EUR without a request', () => {
   renderApiConverter('EUR', 'EUR')

   expect(screen.getAllByText('1 EUR = 1.00 EUR')).toHaveLength(2)
   expect(screen.getByText('1.00€')).toBeInTheDocument()
   expect(fetchMock).not.toHaveBeenCalled()
  })

  test.each([
   ['USD', '1.11', '0.90'],
   ['SGD', '1.42', '0.70'],
  ])('converts EUR to %s and swaps the currencies', async (code, expected, swapped) => {
   mockRates()
   renderApiConverter('EUR', code)
   expect((await screen.findAllByText(`1 EUR = ${expected} ${code}`)).length).toBeGreaterThan(0)
   expect(screen.getByRole('combobox', { name: RegExp('from', 'i') })).toHaveValue('EUR')
   expect(screen.getByRole('combobox', { name: RegExp('to', 'i') })).toHaveValue(code)
   expect(within(screen.getByText('From', { selector: 'label' })).getByRole('presentation')).toHaveAttribute('src', 'EUR-flag.svg')
   expect(within(screen.getByText('To', { selector: 'label' })).getByRole('presentation')).toHaveAttribute('src', `${code}-flag.svg`)

   // Swap the selected currencies and check the reverse conversion.
   fireEvent.click(screen.getByRole('button', { name: RegExp('swap currencies', 'i') }))
   expect((await screen.findAllByText(`1 ${code} = ${swapped} EUR`)).length).toBeGreaterThan(0)
   expect(screen.getByRole('combobox', { name: RegExp('from', 'i') })).toHaveValue(code)
   expect(screen.getByRole('combobox', { name: RegExp('to', 'i') })).toHaveValue('EUR')
   expect(within(screen.getByText('From', { selector: 'label' })).getByRole('presentation')).toHaveAttribute('src', `${code}-flag.svg`)
   expect(within(screen.getByText('To', { selector: 'label' })).getByRole('presentation')).toHaveAttribute('src', 'EUR-flag.svg')
  })

  test('shows a server error before and after swapping', async () => {
   mockRates('USD')
   renderApiConverter('EUR', 'USD')
   expect(await screen.findByRole('alert')).toHaveTextContent('USD: Error requesting USD rate: Server unavailable')
   expect(screen.getAllByText('1 EUR = — USD').length).toBeGreaterThan(0)

   // Swap the currencies after the destination request fails.
   fireEvent.click(screen.getByRole('button', { name: RegExp('swap currencies', 'i') }))
   expect(screen.getByRole('alert')).toHaveTextContent('USD: Error requesting USD rate: Server unavailable')
   expect(screen.getAllByText('1 USD = — EUR').length).toBeGreaterThan(0)
  })
 })

 describe('To is EUR', () => {
  test('shows the same amount when From is EUR without a request', () => {
   renderApiConverter('EUR', 'EUR')

   expect(screen.getAllByText('1 EUR = 1.00 EUR')).toHaveLength(2)
   expect(fetchMock).not.toHaveBeenCalled()
  })

  test.each([
   ['USD', '0.90', '1.11'],
   ['SGD', '0.70', '1.42'],
  ])('converts %s to EUR and swaps the currencies', async (code, expected, swapped) => {
   mockRates()
   renderApiConverter(code, 'EUR')
   expect((await screen.findAllByText(`1 ${code} = ${expected} EUR`)).length).toBeGreaterThan(0)

   // Swap the selected currencies and check the reverse conversion.
   fireEvent.click(screen.getByRole('button', { name: RegExp('swap currencies', 'i') }))
   expect((await screen.findAllByText(`1 EUR = ${swapped} ${code}`)).length).toBeGreaterThan(0)
  })

  test.each(['USD', 'SGD'])('shows a server error for %s to EUR', async (code) => {
   mockRates(code)
   renderApiConverter(code, 'EUR')

   expect(await screen.findByRole('alert')).toHaveTextContent(`${code}: Error requesting ${code} rate: Server unavailable`)
   expect(screen.queryByRole('status')).not.toBeInTheDocument()
   expect(screen.getAllByText(`1 ${code} = — EUR`).length).toBeGreaterThan(0)
  })
 })

 describe('changing the selected currencies', () => {
  test('changes From to SGD and then To to USD', async () => {
   mockRates()
   renderApiConverter('USD', 'EUR')
   expect((await screen.findAllByText('1 USD = 0.90 EUR')).length).toBeGreaterThan(0)

   // Select SGD as the From currency.
   fireEvent.change(screen.getByRole('combobox', { name: RegExp('from', 'i') }), { target: { value: 'SGD' } })
   expect((await screen.findAllByText('1 SGD = 0.70 EUR')).length).toBeGreaterThan(0)

   // Select USD as the To currency.
   fireEvent.change(screen.getByRole('combobox', { name: RegExp('to', 'i') }), { target: { value: 'USD' } })
   expect((await screen.findAllByText('1 SGD = 0.78 USD')).length).toBeGreaterThan(0)
  })

  test('shows an error when the new From currency request fails', async () => {
   mockRates('SGD')
   renderApiConverter('USD', 'EUR')
   expect((await screen.findAllByText('1 USD = 0.90 EUR')).length).toBeGreaterThan(0)

   // Select SGD as the From currency while the server is unavailable for SGD.
   fireEvent.change(screen.getByRole('combobox', { name: RegExp('from', 'i') }), { target: { value: 'SGD' } })
   expect(await screen.findByRole('alert')).toHaveTextContent('SGD: Error requesting SGD rate: Server unavailable')
   expect(screen.getAllByText('1 SGD = — EUR').length).toBeGreaterThan(0)
  })

  test('shows an error when the new To currency request fails', async () => {
   mockRates()
   renderApiConverter('USD', 'EUR')
   expect((await screen.findAllByText('1 USD = 0.90 EUR')).length).toBeGreaterThan(0)

   // Select SGD as the From currency before the destination request fails.
   fireEvent.change(screen.getByRole('combobox', { name: RegExp('from', 'i') }), { target: { value: 'SGD' } })
   expect((await screen.findAllByText('1 SGD = 0.70 EUR')).length).toBeGreaterThan(0)
   mockRates('USD')

   // Select USD as the To currency while the server is unavailable for USD.
   fireEvent.change(screen.getByRole('combobox', { name: RegExp('to', 'i') }), { target: { value: 'USD' } })
   expect(await screen.findByRole('alert')).toHaveTextContent('USD: Error requesting USD rate: Server unavailable')
   expect(screen.getAllByText('1 SGD = — USD').length).toBeGreaterThan(0)
  })
 })
})