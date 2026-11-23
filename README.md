# Currency Converter

Currency Converter is a React, TypeScript, and Redux application that converts
amounts between 12 currencies using European Central Bank (ECB) reference
exchange rates.

![Currency Converter main page](./src/assets/MainPage.png)

## 🌐 Production site

[dailyecbrates.com](http://dailyecbrates.com/)

## 🧭 How to use the converter

1. **Enter an amount.** Use the Amount field to enter a non-negative number,
   including decimals. The result updates as the amount changes.

   ![Amount field highlighted](./src/assets/amount.png)

2. **Choose the original currency.** Select the currency you are converting
   from in the From list.

   ![From currency selector highlighted](./src/assets/From.png)

3. **Choose the destination currency.** Select the currency you want to
   receive in the To list. Each selector shows the currency name and country,
   with a flag beside the label.

   ![To currency selector highlighted](./src/assets/To.png)

4. **Swap currencies if needed.** Use the arrows between the selectors to
   exchange the From and To currencies.

   ![Swap currencies button highlighted](./src/assets/Swift.png)

5. **Read the result.** The page displays the converted amount, the exchange
   rate for one unit, and a summary of the conversion. It shows a loading
   message while required rates are being fetched and an error if a request
   fails. Selecting the same currency on both sides keeps the amount unchanged.

   ![Example conversion from Canadian dollars to Japanese yen](./src/assets/DifferentsCurrencies.png)

## 💱 Available currencies

| Code | Currency | Country or region |
| --- | --- | --- |
| USD | US Dollar | United States |
| SGD | Singapore Dollar | Singapore |
| EUR | Euro | Eurozone |
| GBP | Pound Sterling | United Kingdom |
| JPY | Japanese Yen | Japan |
| CAD | Canadian Dollar | Canada |
| AUD | Australian Dollar | Australia |
| CHF | Swiss Franc | Switzerland |
| CNY | Chinese Yuan | China |
| INR | Indian Rupee | India |
| MXN | Mexican Peso | Mexico |
| BRL | Brazilian Real | Brazil |

## 🏦 Exchange rate source

The application requests reference rates from the
[European Central Bank](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html).
The ECB normally updates them each working day, excluding weekends and certain
holidays. These are reference rates, not live trading or transaction rates.

The rates use EUR as the base: `1 EUR = 1 EUR`, and other rates express how
many units of a currency equal one euro. The application uses those rates to
calculate conversions between the selected currencies. Available rates are
reused as the amount changes; the current implementation does not check
whether rates for two currencies were published on the same date.

## 🚀 Install and run

You need Node.js and npm installed.

```sh
git clone https://github.com/2020LM/CurrencyConverter.git
cd CurrencyConverter
npm install
npm run dev
```

Open the local URL printed by Vite in your browser.

## 🧪 Tests

Run the Jest test suite:

```sh
npm test
```

The converter tests currently use the RTK Query implementation and configure
the API reducer and middleware in their own test stores.

## 📦 Production build

Check TypeScript and create the production build in `dist`:

```sh
npm run build
```

To preview the build locally:

```sh
npm run preview
```

## 🔄 Data fetching with RTK Query

RTK Query was chosen because it lets the component declare the data it needs
while managing request states and caching automatically. Compared with manually
coordinating requests and state updates using Redux Thunk or `createAsyncThunk`,
this reduces boilerplate and helps reuse cached rates rather than repeat
requests. The converter's data-fetching needs are straightforward, so this
approach fits the project and makes it easier to develop and maintain.

The [RTK Query API](./src/services/moneyRequest/RTKQuery.ts) defines a
`getRate` endpoint that looks up a currency by code and uses custom ECB
request and XML parsing logic. RTK Query caches results by endpoint and
currency code. The converter uses `currentData` to avoid displaying a previous currency's rate
while another rate is loading. EUR uses a rate of 1 without a request, and
selecting the same currency on both sides does not require a rate request.

The [RTK Query slice](./src/state/slices/currencySliceRTKQuery.ts) stores the
amount and selected currencies; the API manages rate data, loading states,
and errors. The [store](./src/state/store.ts) registers the API reducer and
middleware.

## 📄 Licenses

Country flags are from [Flag Icons](https://github.com/lipis/flag-icons);
their license is available in [LICENSE](./src/assets/countries/LICENSE).

## 👤 Author

[Gabriel Oviedo](https://github.com/2020LM)
