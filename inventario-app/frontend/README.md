# frontend

Frontend de **Inventario App** — Vite + React (JavaScript) + Tailwind CSS.

## Requisitos

- Node.js 18+
- `service-auth` corriendo en `http://localhost:4001`

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
| `/dashboard` | Protegida (requiere JWT en memoria) |
