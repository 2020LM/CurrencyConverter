// Internal imports
import styles from './converter.module.css'
import swapIcon from '../../../assets/arrow-left-right.svg'
import { setFrom, setTo, swapCurrencies } from '../../../state/slices/currencySlice'
import { useAppSelector } from '../../../state/store'
import type { AppDispatch } from '../../../state/store'
import { useDebounce } from '../../../internalTools/customHooks/useDebounce'
import { exchangeCurrency } from '../../../services/moneyRequest/thunkRequest'

// External imports
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

export const Converter = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { currencies, from, to, amount, result } = useAppSelector((state) => state.currency)
  const fromCurrency = currencies.find((currency) => currency.shortName === from.code)
  const toCurrency = currencies.find((currency) => currency.shortName === to.code)
  const currentRate = from.code === to.code
    ? 1
    : from.rate !== null && to.rate !== null
      ? to.rate / from.rate
      : null
  const formattedResult = result === null ? '—' : result.toFixed(2)

  useEffect(() => {
    void dispatch(exchangeCurrency(amount))
  }, [dispatch, amount, from.code, to.code])

  useDebounce(amount, from.code, to.code)

  return (
    <div className={styles.card}>
      <form>
        <div className={styles.controls}>
          <div className={styles.field}>
            <label htmlFor="amount">Amount</label>
            <input type="text" id="amount" aria-label="Amount" value={amount} onChange={(e) => { void dispatch(exchangeCurrency(e.target.value)) }} />
          </div>

          <div className={styles.field}>
            <label htmlFor="from" className={styles.currencyLabel}>
              From {fromCurrency && <img src={fromCurrency.src} alt="" className={styles.flag} />}
            </label>
            <select id="from" value={from.code} onChange={(e) => dispatch(setFrom(e.target.value))}>
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
            <select id="to" value={to.code} onChange={(e) => dispatch(setTo(e.target.value))}>
              {currencies.map((currency) => (
                <option key={currency.shortName} value={currency.shortName}>
                  {currency.shortName} - {currency.currencyName} ({currency.country})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className={styles.result}>
          <p>{currentRate === null ? 'Exchange rate unavailable' : 'Current Value:'}</p>
          <p>{formattedResult}{result !== null && toCurrency?.logo}</p>
          <p>1 {from.code} = {currentRate ?? '—'} {to.code}</p>
          <p>{amount} {from.code} = {formattedResult} {to.code}</p>
          {from.error && <p role="alert">{from.code}: {from.error}</p>}
          {to.error && <p role="alert">{to.code}: {to.error}</p>}
        </div>

      </form>
    </div>
  )
}

export default Converter