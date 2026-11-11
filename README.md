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

Las tasas y los resultados actuales son provisionales: se usa una tasa fija de
1 para todas las divisas, no datos reales de una API. Las banderas provienen de
[Flag Icons](https://github.com/lipis/flag-icons); su licencia esta en
`src/assets/countries/LICENSE`.
