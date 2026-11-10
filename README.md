# Currency Converter

Convert currencies on demand and compare three Redux approaches to fetching the same exchange rates.

## Run locally

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
```

Open the address printed by Vite. Choose an implementation, enter a non-negative amount, select currencies, and press **Convert**. Rates come from the public [ExchangeRate-API](https://www.exchangerate-api.com/) open endpoint; no API key is required. An internet connection is needed, and rates are indicative rather than a financial quote.

## Comparing the implementations

| Implementation | Request handling | Caching |
| --- | --- | --- |
| Redux Thunk | Manually dispatches request, success, and failure actions. | None |
| `createAsyncThunk` | Generates lifecycle actions handled by a slice. | None |
| RTK Query | Manages request state through a generated query hook. | Rates are cached by base currency for reuse. |

All three use the same service and currency choices. Switch approaches using the Implementation selector; the code is in `src/store.js`, and the shared UI is in `src/main.jsx`.

Run `npm test` for focused request-state tests and `npm run build` for a production build.
