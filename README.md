# Currency Converter

Aplicacion inicial creada con React, TypeScript y Vite.

## Requisitos

- Node.js y npm

## Empezar

```sh
npm install
npm run dev
```

## Comandos

```sh
npm test       # Ejecutar pruebas con Jest
npm run build  # Comprobar TypeScript y generar la version de produccion
npm run lint   # Revisar el codigo
```

Bootstrap se carga desde `src/main.tsx`. El store de Redux esta en
`src/state/store.ts` y las divisas iniciales en
`src/components/converter/data/currencyData.ts`.

El euro tiene una tasa base de 1; las demas tasas se consultan al BCE.
Hasta obtenerlas no se muestra una conversion entre distintas monedas.
Las banderas provienen de
[Flag Icons](https://github.com/lipis/flag-icons); su licencia esta en
`src/assets/countries/LICENSE`.

Cada divisa incluye un `link` al Banco Central Europeo (BCE).
`requestRate(currency)` devuelve una promesa con unidades de la divisa por
1 EUR. Para EUR devuelve 1 sin consultar el enlace; su enlace apunta a la
serie USD/EUR y no representa una tasa EUR/EUR. Si falla la consulta o los
datos no son validos, la promesa se rechaza.

Las tasas del BCE son referencias publicadas, no cotizaciones en tiempo real. Al calcular una
conversion entre dos divisas, es importante utilizar tasas de la misma fecha;
la implementacion actual aun no verifica que las fechas coincidan.

El thunk manual `exchangeCurrency(amount)` actualiza la cantidad y consulta las
tasas necesarias. El slice guarda el resultado numerico, las tasas y sus
errores; descarta respuestas de selecciones anteriores y recalcula el resultado
con la cantidad mas reciente. Al escribir, se reutilizan las tasas disponibles.
