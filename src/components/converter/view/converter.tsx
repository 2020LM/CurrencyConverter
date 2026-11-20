// Internal imports
import styles from './converter.module.css'
import swapIcon from '../../../assets/arrow-left-right.svg'
import type { AppDispatch } from '../../../state/store'
import { useAppSelector } from '../../../state/store'
import { EUR } from '../../../constants/currencyNames'

// Thunk Implementation
//import { setFrom, setTo, swapCurrencies } from '../../../state/slices/currencySliceThunk'
//import { exchangeCurrency } from '../../../services/moneyRequest/thunkRequest'
//import { useDebounce } from '../../../internalTools/customHooks/useDebounce'

// createAsyncTunk Implemenation
//import { setFrom, setTo, swapCurrencies } from '../../../state/slices/currencySliceAsyncThunk'
//import { exchangeCurrency } from '../../../services/moneyRequest/asyncThunkRequest'

// RTK Query Implemenation
import { setAmount, setFrom, setTo, swapCurrencies } from '../../../state/slices/currencySliceRTKQuery'
import { useGetRateQuery } from '../../../services/moneyRequest/RTKQuery'

// External imports
//import { useEffect } from 'react' // Thunk and createAsyncThunk implementations
import { useDispatch } from 'react-redux'

export const Converter = () => {
  const dispatch = useDispatch<AppDispatch>()

  // Thunk and createAsyncThunk implementations
  // const { currencies, from, to, amount, result, requestIds } = useAppSelector((state) => state.currency)
  // const currentRate = from.code === to.code
  //   ? 1
  //   : from.rate !== null && to.rate !== null
  //     ? to.rate / from.rate
  //     : null
  // const loading = from.code !== to.code && (requestIds.from !== null || requestIds.to !== null)
  //
  // useEffect(() => {
  //   void dispatch(exchangeCurrency(amount))
  // }, [dispatch, amount, from.code, to.code])
  //
  // useDebounce(amount, from.code, to.code)

  // RTK Query implementation
  const { currencies, from, to, amount } = useAppSelector((state) => state.currency)
  const fromCurrency = currencies.find((currency) => currency.shortName === from.code)
  const toCurrency = currencies.find((currency) => currency.shortName === to.code)
  const sameCurrency = from.code === to.code
  const fromQuery = useGetRateQuery(from.code, { skip: sameCurrency || from.code === EUR })
  const toQuery = useGetRateQuery(to.code, { skip: sameCurrency || to.code === EUR })
  const fromRate = from.code === EUR ? 1 : fromQuery.currentData
  const toRate = to.code === EUR ? 1 : toQuery.currentData
  const currentRate = sameCurrency
    ? 1
    : fromRate !== undefined && toRate !== undefined && !fromQuery.isError && !toQuery.isError
      ? toRate / fromRate
      : null
  const numericAmount = Number(amount)
  const validAmount = amount.trim() !== '' && Number.isFinite(numericAmount) && numericAmount >= 0
  const result = !validAmount
    ? null
    : sameCurrency
      ? numericAmount
      : currentRate !== null && fromRate !== undefined && toRate !== undefined
        ? numericAmount * toRate / fromRate
        : null
  const formattedResult = result === null ? '—' : result.toFixed(2)
  const loading = !sameCurrency && (fromQuery.isFetching || toQuery.isFetching)

  return (
    <div className={styles.card}>
      <form>
        <div className={styles.controls}>
          <div className={styles.field}>
            <label htmlFor="amount">Amount</label>
            {/* Thunk and createAsyncThunk implementations
            <input type="number" min="0" step="any" id="amount" aria-label="Amount" value={amount} onChange={(e) => { void dispatch(exchangeCurrency(e.target.value)) }} />
            */}
            <input type="number" min="0" step="any" id="amount" aria-label="Amount" value={amount} onChange={(e) => dispatch(setAmount(e.target.value))} />
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
          <p>{loading ? <span role="status">Loading...</span> : currentRate === null ? 'Exchange rate unavailable' : 'Current Value:'}</p>
          <p>{formattedResult}{result !== null && toCurrency?.logo}</p>
          <p>1 {from.code} = {currentRate === null ? '—' : currentRate.toFixed(2)} {to.code}</p>
          <p>{amount} {from.code} = {formattedResult} {to.code}</p>
          {/* Thunk and createAsyncThunk implementations
          {from.error && <p role="alert">{from.code}: {from.error}</p>}
          {to.error && <p role="alert">{to.code}: {to.error}</p>}
          */}
          {fromQuery.isError && <p role="alert">{from.code}: {typeof fromQuery.error === 'string' ? fromQuery.error : fromQuery.error?.message ?? 'Exchange rate request failed'}</p>}
          {toQuery.isError && <p role="alert">{to.code}: {typeof toQuery.error === 'string' ? toQuery.error : toQuery.error?.message ?? 'Exchange rate request failed'}</p>}
        </div>

      </form>
    </div>
  )
}

export default Converter