# inventario-app (Ynventory)

Monorepo de un sistema de gestión de inventario con arquitectura distribuida:
un frontend React y tres microservicios Node.js/Express independientes.
Cada carpeta tiene su propio `package.json` (sin Turborepo, Nx ni Lerna).

## Descripción

**Ynventory** permite registrar usuarios, autenticarse con JWT, administrar
productos (CRUD), registrar entradas/salidas de stock, consultar alertas de
inventario bajo o agotado, y ver reportes agregados.

- Contraseñas hasheadas con **Argon2**
- Autenticación con **JWT** (Bearer) compartido entre servicios
- `service-reports` no tiene base de datos propia: consume `service-inventory` por HTTP

## Arquitectura

```
                         ┌─────────────────────┐
                         │   frontend (:5173)  │
                         │  Vite + React + TW  │
                         └──────────┬──────────┘
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
   │ service-auth     │  │ service-inventory│  │ service-reports  │
   │ :4001            │  │ :4002            │  │ :4003            │
   │ JWT + Argon2     │  │ Productos /      │  │ Alertas /        │
   │ MongoDB (auth)   │  │ Movimientos      │  │ Reportes         │
   └──────────────────┘  │ MongoDB (inv.)   │  └────────┬─────────┘
                         └──────────────────┘           │
                                   ▲                    │
                                   └────────────────────┘
                                      HTTP GET /products
```

| Componente          | Puerto | Stack                                      | Persistencia                          |
| ------------------- | ------ | ------------------------------------------ | ------------------------------------- |
| `frontend`          | 5173   | Vite, React, Tailwind, Zustand, Axios      | `localStorage` (JWT)                  |
| `service-auth`      | 4001   | Express, Mongoose, Argon2, JWT             | MongoDB `inventario_auth`             |
| `service-inventory` | 4002   | Express, Mongoose, JWT                     | MongoDB `inventario_inventory`        |
| `service-reports`   | 4003   | Express, Axios, JWT (sin modelos propios)  | Ninguna (consulta inventory por HTTP) |

## Requisitos previos

- Node.js 18+
- MongoDB en ejecución (local o remoto)
- Cuatro terminales (una por componente)

## Cómo levantar el proyecto (orden recomendado)

> Orden: **auth → inventory → reports → frontend**.
> Reports depende de inventory; el frontend necesita los tres backends.

### 1. service-auth (puerto 4001)

```bash
cd service-auth
cp .env.example .env
npm install
npm run dev
```

### 2. service-inventory (puerto 4002)

```bash
cd service-inventory
cp .env.example .env
npm install
npm run dev
```

### 3. service-reports (puerto 4003)

```bash
cd service-reports
cp .env.example .env
npm install
npm run dev
```

Asegúrate de que `JWT_SECRET` sea **idéntico** en auth, inventory y reports.

### 4. frontend (puerto 5173)

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173).

Para producción local de cada backend: `npm start` (sin nodemon).
En el frontend, `npm start` y `npm run dev` ejecutan Vite; `npm run build` + `npm run preview` sirven el build.

## Variables de entorno

### `service-auth` (`.env.example`)

| Variable     | Ejemplo                                         | Descripción                |
| ------------ | ----------------------------------------------- | -------------------------- |
| `AUTH_PORT`  | `4001`                                          | Puerto del servicio        |
| `MONGO_URI`  | `mongodb://localhost:27017/inventario_auth`     | MongoDB de usuarios        |
| `JWT_SECRET` | `changeme`                                      | Secreto para firmar JWT    |

### `service-inventory` (`.env.example`)

| Variable          | Ejemplo                                             | Descripción                         |
| ----------------- | --------------------------------------------------- | ----------------------------------- |
| `INVENTORY_PORT`  | `4002`                                              | Puerto del servicio                 |
| `MONGO_URI`       | `mongodb://localhost:27017/inventario_inventory`    | MongoDB de productos/movimientos    |
| `JWT_SECRET`      | `changeme`                                          | Mismo secreto que auth              |

### `service-reports` (`.env.example`)

| Variable                 | Ejemplo                       | Descripción                              |
| ------------------------ | ----------------------------- | ---------------------------------------- |
| `REPORTS_PORT`           | `4003`                        | Puerto del servicio                      |
| `INVENTORY_SERVICE_URL`  | `http://localhost:4002`       | Base URL de service-inventory            |
| `JWT_SECRET`             | `changeme`                    | Mismo secreto que auth                   |

### `frontend` (`.env.example`)

| Variable              | Ejemplo                       | Descripción                |
| --------------------- | ----------------------------- | -------------------------- |
| `VITE_AUTH_URL`       | `http://localhost:4001`       | Base URL de auth           |
| `VITE_INVENTORY_URL`  | `http://localhost:4002`       | Base URL de inventory      |
| `VITE_REPORTS_URL`    | `http://localhost:4003`       | Base URL de reports        |

## Endpoints principales

### service-auth (`:4001`)

| Método | Ruta             | Auth   | Descripción        |
| ------ | ---------------- | ------ | ------------------ |
| POST   | `/auth/register` | No     | Registrar usuario  |
| POST   | `/auth/login`    | No     | Login → `{ token }`|
| GET    | `/auth/me`       | Bearer | Usuario actual     |

### service-inventory (`:4002`)

| Método | Ruta             | Auth   | Descripción                          |
| ------ | ---------------- | ------ | ------------------------------------ |
| GET    | `/products`      | Bearer | Listar / buscar (`?nombre=&categoria=`)|
| POST   | `/products`      | Bearer | Crear producto                       |
| PUT    | `/products/:id`  | Bearer | Actualizar producto                  |
| DELETE | `/products/:id`  | Bearer | Soft delete (`activo: false`)        |
| POST   | `/entries`       | Bearer | Entrada de stock                     |
| POST   | `/outputs`       | Bearer | Salida de stock                      |

### service-reports (`:4003`)

| Método | Ruta                      | Auth   | Descripción                    |
| ------ | ------------------------- | ------ | ------------------------------ |
| GET    | `/health`                 | No     | Health check                   |
| GET    | `/alerts/low-stock`       | Bearer | Stock bajo (`?threshold=5`)    |
| GET    | `/alerts/out-of-stock`    | Bearer | Sin stock                      |
| GET    | `/reports/summary`        | Bearer | Resumen de inventario          |
| GET    | `/reports/categories`     | Bearer | Agregado por categoría         |
| GET    | `/reports/top-products`   | Bearer | Top por valor (`?limit=5`)     |

## Frontend — rutas

| Ruta            | Acceso     | Función                          |
| --------------- | ---------- | --------------------------------- |
| `/login`        | Pública    | Iniciar sesión                    |
| `/register`     | Pública    | Crear cuenta                      |
| `/dashboard`    | Protegida  | Inicio / accesos rápidos          |
| `/productos`    | Protegida  | CRUD de productos                 |
| `/movimientos`  | Protegida  | Entradas y salidas                |
| `/alertas`      | Protegida  | Stock bajo / agotado              |
| `/reportes`     | Protegida  | Resumen, categorías, top         |

El JWT se guarda en `localStorage` (`ynventory-auth`). Sin token válido, las
rutas del panel redirigen a `/login`.

## Scripts npm

| Paquete             | `npm run dev`              | `npm start`            |
| ------------------- | -------------------------- | ---------------------- |
| `service-auth`      | `nodemon src/server.js`    | `node src/server.js`   |
| `service-inventory` | `nodemon src/server.js`    | `node src/server.js`   |
| `service-reports`   | `nodemon src/index.js`     | `node src/index.js`    |
| `frontend`          | `vite` (HMR)               | `vite`                 |

> El frontend usa Vite (no nodemon). Los tres backends usan nodemon en `dev`.

## Estructura del monorepo

```
inventario-app/
  frontend/            # UI Ynventory
  service-auth/        # Auth + usuarios
  service-inventory/   # Productos + movimientos
  service-reports/     # Alertas + reportes (HTTP → inventory)
  README.md
```
