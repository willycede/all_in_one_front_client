# Tests E2E (Playwright)

## Requisitos

```bash
npm install --legacy-peer-deps
npx playwright install chromium
```

## Ejecutar

Con build de producción (recomendado en CI):

```bash
npm run build
CI=true PORT=8099 npm run test:e2e
```

Playwright levanta `serve dist` en CI o `npm run serve` en local.

## Specs

| Archivo | Qué valida |
|---------|------------|
| `e2e/smoke.spec.js` | Catálogo, sidebar, auth guard, home |
| `e2e/checkout.spec.js` | Login → carrito, cupón, diálogo confirmar (API mock) |

Los tests de checkout interceptan `**/api/**` — no requieren MySQL ni API real.

## CI

GitHub Actions: build → Playwright chromium → `npm run test:e2e` con `CI=true`.
