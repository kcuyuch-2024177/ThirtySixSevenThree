# ThirtySixSevenThree

Proyecto de práctica final: **Ynventory** (sistema de inventario distribuido).

La aplicación vive en la carpeta [`inventario-app/`](./inventario-app/).

## Ejecutar (resumen)

1. Instala Node.js 18+ y arranca MongoDB.
2. Entra a `inventario-app/`.
3. Copia cada `.env.example` → `.env` (auth, inventory, reports, frontend).
4. Asegura el mismo `JWT_SECRET` en los tres backends.
5. `npm install` en cada carpeta.
6. Arranca en orden: **auth (4001) → inventory (4002) → reports (4003) → frontend (5173)**.
7. Abre http://localhost:5173

Guía completa paso a paso: [`inventario-app/README.md`](./inventario-app/README.md).
