import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { loadRates, loadRatesAsync, makeStore, ratesApi } from './store.js';
import './style.css';

const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL', 'MXN', 'NZD', 'SGD', 'HKD', 'KRW', 'ZAR', 'SEK', 'NOK', 'DKK', 'PLN'];
const methods = {
  thunk: { title: 'Redux Thunk', description: 'Manual actions and reducers manage the request lifecycle.' },
  async: { title: 'createAsyncThunk', description: 'Redux Toolkit generates pending, fulfilled, and rejected actions.' },
  query: { title: 'RTK Query', description: 'RTK Query manages request state and caches rates by base currency.' },
};

function Converter({ method }) {
  const dispatch = useDispatch();
  const thunkState = useSelector((state) => state.thunkRates);
  const asyncState = useSelector((state) => state.asyncRates);
  const [getRates, queryState] = ratesApi.useLazyGetRatesQuery();
  const [amount, setAmount] = useState('1');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [submitted, setSubmitted] = useState(null);

  const current = method === 'thunk' ? thunkState : asyncState;
  const loading = method === 'query' ? queryState.isFetching : current.status === 'loading';
  const error = method === 'query' ? queryState.error?.error : current.error;
  const data = method === 'query' ? queryState.currentData : current.data;
  const rate = submitted && data?.base_code === submitted.from ? data.rates[submitted.to] : null;
  const validRate = typeof rate === 'number' && Number.isFinite(rate) && rate > 0;
  const converted = validRate ? submitted.amount * rate : null;

  function convert(event) {
    event.preventDefault();
    const value = Number(amount);
    if (amount.trim() === '' || !Number.isFinite(value) || value < 0) return;
    setSubmitted({ amount: value, from, to });
    if (method === 'thunk') dispatch(loadRates(from));
    else if (method === 'async') dispatch(loadRatesAsync(from));
    else getRates(from, true);
  }

  return (
    <form onSubmit={convert} className="card">
      <p className="method-description">{methods[method].description}</p>
      <label htmlFor="amount">Amount</label>
      <input id="amount" type="number" min="0" step="any" required value={amount} onChange={(event) => setAmount(event.target.value)} />
      <div className="currency-fields">
        <div>
          <label htmlFor="from">From</label>
          <select id="from" value={from} onChange={(event) => setFrom(event.target.value)}>
            {currencies.map((currency) => <option key={currency}>{currency}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="to">To</label>
          <select id="to" value={to} onChange={(event) => setTo(event.target.value)}>
            {currencies.map((currency) => <option key={currency}>{currency}</option>)}
          </select>
        </div>
      </div>
      <button type="submit" disabled={loading}>{loading ? 'Converting…' : 'Convert'}</button>
      <div className="result" aria-live="polite">
        {loading && <p>Loading exchange rates…</p>}
        {!loading && submitted && error && <p className="error">{error}</p>}
        {!loading && submitted && !error && data && !validRate && <p className="error">No exchange rate is available for {submitted.to}.</p>}
        {!loading && submitted && !error && validRate && (
          Number.isFinite(converted) ? (
            <>
              <p className="conversion">{new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(submitted.amount)} {submitted.from} =</p>
              <p className="total">{new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(converted)} {submitted.to}</p>
              <p>1 {submitted.from} = {rate} {submitted.to}</p>
              {data.time_last_update_utc && <p>Rates updated: {data.time_last_update_utc}</p>}
            </>
          ) : <p className="error">The converted amount is too large to display.</p>
        )}
      </div>
    </form>
  );
}

function App() {
  const [method, setMethod] = useState('thunk');
  return (
    <main>
      <header>
        <p className="eyebrow">One converter, three approaches</p>
        <h1>Currency Converter</h1>
        <p>Compare Redux async patterns using the same live exchange rates.</p>
      </header>
      <label htmlFor="method">Implementation</label>
      <select id="method" value={method} onChange={(event) => setMethod(event.target.value)}>
        {Object.entries(methods).map(([key, value]) => <option key={key} value={key}>{value.title}</option>)}
      </select>
      <Converter key={method} method={method} />
      <footer>Rates provided by ExchangeRate-API. Rates are indicative, not a quote.</footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<Provider store={makeStore()}><App /></Provider>);
