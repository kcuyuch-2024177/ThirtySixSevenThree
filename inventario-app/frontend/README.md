# frontend

Frontend de **Ynventory** — Vite + React (JavaScript) + Tailwind CSS.

## Marca

Paleta base (CSS `/src/index.css` con `@theme`):

| Token | Hex |
|---|---|
| `brand-blue` | `#3B5897` |
| `brand-purple` | `#5411AE` |
| `brand-deep` | `#36084D` |
| `brand-lavender` | `#A785EF` |
| `brand-violet` | `#8280F7` |

Logo: `/public/logo-ynventory.png`

## Requisitos

- Node.js 18+
- `service-auth` en `http://localhost:4001`
- `service-inventory` en `http://localhost:4002`
- `service-reports` en `http://localhost:4003`

## Configuración

```bash
cp .env.example .env
npm install
npm run dev
```

La app queda en `http://localhost:5173`.

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_AUTH_URL` | Base URL de service-auth | `http://localhost:4001` |
| `VITE_INVENTORY_URL` | Base URL de service-inventory | `http://localhost:4002` |
| `VITE_REPORTS_URL` | Base URL de service-reports | `http://localhost:4003` |

## Rutas

| Ruta | Acceso |
|---|---|
| `/login` | Pública |
| `/register` | Pública |
| `/dashboard` | Protegida (JWT en `localStorage`) |
| `/productos` | Protegida |
| `/movimientos` | Protegida |
| `/alertas` | Protegida (`service-reports`) |
| `/reportes` | Protegida (`service-reports`) |

El JWT se guarda en `localStorage` (`ynventory-auth`) para persistir la sesión al recargar.
Sin token válido, las rutas del panel redirigen a `/login`.
