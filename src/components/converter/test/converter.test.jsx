// Internal imports
import Converter from '../view/converter.tsx'
import currencyReducer from '../../../state/slices/currencySlice'


// External imports
import { configureStore } from '@reduxjs/toolkit'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { Provider } from 'react-redux'
import '@testing-library/jest-dom'

jest.mock('../data/currencyData', () => {
 const actual = jest.requireActual('../data/currencyData')
 return {
  currencyData: actual.currencyData.map((currency) => ({
   ...currency,
   src: `${currency.shortName}-flag.svg`,
  })),
 }
})

function renderConverter() {
 const store = configureStore({ reducer: { currency: currencyReducer } })
 render(<Provider store={store}><Converter /></Provider>)
}

test('renders Converter component', () => {
 renderConverter()

 // To check the existance of all the elements in the component.
 expect(screen.getAllByRole('textbox')).toHaveLength(1)
 expect(screen.getAllByRole('combobox')).toHaveLength(2)
 expect(screen.getAllByRole('paragraph')).toHaveLength(4)
 expect(screen.getAllByRole('button')).toHaveLength(1)

 // To check the text content of the elements.
 expect(screen.getByRole('textbox', { name: RegExp('Amount','i')})).toBeInTheDocument()
 expect(screen.getByRole('combobox', { name: RegExp('From','i')})).toBeInTheDocument()
 expect(screen.getByRole('combobox', { name: RegExp('To','i')})).toBeInTheDocument()
})

test('shows twelve currencies in both selectors with provisional rates', () => {
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
 expect(screen.getByText('2.00€')).toBeInTheDocument()
 expect(within(screen.getByText('From', { selector: 'label' })).getByRole('presentation')).toHaveAttribute('src', 'USD-flag.svg')
 expect(within(screen.getByText('To', { selector: 'label' })).getByRole('presentation')).toHaveAttribute('src', 'EUR-flag.svg')
 expect(screen.getByText('1 USD = 1 EUR')).toBeInTheDocument()
 expect(screen.getByText(/placeholder rates/i)).toBeInTheDocument()
})

test('selects and swaps currencies and updates the provisional result', () => {
 renderConverter()

 const from = screen.getByRole('combobox', { name: RegExp('from', 'i') })
 const to = screen.getByRole('combobox', { name: RegExp('to', 'i') })

 fireEvent.change(from, { target: { value: 'SGD' } })
 fireEvent.change(to, { target: { value: 'JPY' } })
 expect(within(screen.getByText('From', { selector: 'label' })).getByRole('presentation')).toHaveAttribute('src', 'SGD-flag.svg')
 expect(within(screen.getByText('To', { selector: 'label' })).getByRole('presentation')).toHaveAttribute('src', 'JPY-flag.svg')
 fireEvent.change(screen.getByRole('textbox', { name: RegExp('amount', 'i') }), { target: { value: '5' } })
 expect(screen.getByText('5 SGD = 5.00 JPY')).toBeInTheDocument()
 expect(screen.getByText('5.00¥')).toBeInTheDocument()
 expect(screen.getByText('1 SGD = 1 JPY')).toBeInTheDocument()

 fireEvent.click(screen.getByRole('button', { name: RegExp('swap currencies', 'i') }))
 expect(from).toHaveValue('JPY')
 expect(to).toHaveValue('SGD')
 expect(within(screen.getByText('From', { selector: 'label' })).getByRole('presentation')).toHaveAttribute('src', 'JPY-flag.svg')
 expect(within(screen.getByText('To', { selector: 'label' })).getByRole('presentation')).toHaveAttribute('src', 'SGD-flag.svg')
 expect(screen.getByText('5 JPY = 5.00 SGD')).toBeInTheDocument()
 expect(screen.getByText('5.00S$')).toBeInTheDocument()
 expect(screen.getByText('1 JPY = 1 SGD')).toBeInTheDocument()
})

test('does not display a numeric result for invalid or empty amounts', () => {
 renderConverter()
 const amount = screen.getByRole('textbox', { name: RegExp('amount', 'i') })
 for (const value of ['', '   ', '-5', 'abc']) {
  fireEvent.change(amount, { target: { value } })
  expect(screen.getByText('—')).toBeInTheDocument()
 }
})