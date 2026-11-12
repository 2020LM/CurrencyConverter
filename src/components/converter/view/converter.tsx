// Internal imports
import styles from './converter.module.css'
import swapIcon from '../../../assets/arrow-left-right.svg'
import { setFrom, setTo, swapCurrencies } from '../../../state/slices/currencySlice'
import { useAppSelector } from '../../../state/store'
import type { AppDispatch } from '../../../state/store'
import { useDebounce } from '../../../internalTools/customHooks/useDebounce'

// External imports
import { useState } from 'react'
import { useDispatch } from 'react-redux'

export const Converter = () => {
  const [amount, setAmount] = useState('2')
  const dispatch = useDispatch<AppDispatch>()
  const { currencies, from, to } = useAppSelector((state) => state.currency)
  const fromCurrency = currencies.find((currency) => currency.shortName === from)
  const toCurrency = currencies.find((currency) => currency.shortName === to)
  const currentRate = 1
  const numericAmount = Number(amount)
  const result = amount.trim() !== '' && Number.isFinite(numericAmount) && numericAmount >= 0
    ? (numericAmount * currentRate).toFixed(2)
    : '—'

  useDebounce(amount, from, to)

  return (
    <div className={styles.card}>
      <form>
        <div className={styles.controls}>
          <div className={styles.field}>
            <label htmlFor="amount">Amount</label>
            <input type="text" id="amount" aria-label="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>

          <div className={styles.field}>
            <label htmlFor="from" className={styles.currencyLabel}>
              From {fromCurrency && <img src={fromCurrency.src} alt="" className={styles.flag} />}
            </label>
            <select id="from" value={from} onChange={(e) => dispatch(setFrom(e.target.value))}>
              {currencies.map((currency) => (
                <option key={currency.shortName} value={currency.shortName}>
                  {currency.shortName} - {currency.currencyName} ({currency.country})
                </option>
              ))}
            </select>
          </div>

          <button type="button" aria-label="Swap currencies" className={styles.swapButton} onClick={() => dispatch(swapCurrencies())}>
            <img src={swapIcon} alt="" />
          </button>

          <div className={styles.field}>
            <label htmlFor="to" className={styles.currencyLabel}>
              To {toCurrency && <img src={toCurrency.src} alt="" className={styles.flag} />}
            </label>
            <select id="to" value={to} onChange={(e) => dispatch(setTo(e.target.value))}>
              {currencies.map((currency) => (
                <option key={currency.shortName} value={currency.shortName}>
                  {currency.shortName} - {currency.currencyName} ({currency.country})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className={styles.result}>
          <p>Current Value (placeholder rates): </p>
          <p>{result}{result !== '—' && toCurrency?.logo}</p>
          <p>1 {from} = {currentRate} {to}</p>
          <p>{amount} {from} = {result} {to}</p>
        </div>

      </form>
    </div>
  )
}

export default Converter