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
- Inventario **por usuario** (cada cuenta solo ve sus productos)
- Registro con dominios de correo permitidos y **verificación por email** (JWT)
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

---

## Cómo ejecutar la app (paso a paso)

### Paso 0 — Requisitos

1. Instala **Node.js 18 o superior** (`node -v` para comprobarlo).
2. Instala y arranca **MongoDB** en local (o usa una URI remota).
3. Abre **4 terminales** (una por servicio). En Windows puedes usar PowerShell o la terminal integrada de Cursor/VS Code.

Comprueba MongoDB (ejemplo local):

```bash
mongosh --eval "db.runCommand({ ping: 1 })"
```

Si responde `ok: 1`, ya está listo.

> Trabaja siempre desde la carpeta `inventario-app/`.

```bash
cd inventario-app
```

---

### Paso 1 — Configurar variables de entorno

Copia cada `.env.example` a `.env` (solo la primera vez).

**PowerShell (Windows):**

```powershell
Copy-Item service-auth\.env.example service-auth\.env
Copy-Item service-inventory\.env.example service-inventory\.env
Copy-Item service-reports\.env.example service-reports\.env
Copy-Item frontend\.env.example frontend\.env
```

**Bash / macOS / Linux:**

```bash
cp service-auth/.env.example service-auth/.env
cp service-inventory/.env.example service-inventory/.env
cp service-reports/.env.example service-reports/.env
cp frontend/.env.example frontend/.env
```

**Importante:** el valor de `JWT_SECRET` debe ser **el mismo** en:

- `service-auth/.env`
- `service-inventory/.env`
- `service-reports/.env`

Los archivos `.env` están en `.gitignore` y **no se suben a Git**. Sí se versionan los `.env.example`.

---

### Paso 2 — Instalar dependencias

En cada carpeta (o en 4 terminales):

```bash
cd service-auth && npm install && cd ..
cd service-inventory && npm install && cd ..
cd service-reports && npm install && cd ..
cd frontend && npm install && cd ..
```

---

### Paso 3 — Arrancar los servicios (en este orden)

Orden recomendado: **auth → inventory → reports → frontend**.

#### 3.1 `service-auth` (puerto 4001)

```bash
cd service-auth
npm run dev
```

Debes ver algo como: `service-auth escuchando en el puerto 4001` y conexión a MongoDB.

#### 3.2 `service-inventory` (puerto 4002)

Nueva terminal:

```bash
cd service-inventory
npm run dev
```

#### 3.3 `service-reports` (puerto 4003)

Nueva terminal:

```bash
cd service-reports
npm run dev
```

#### 3.4 `frontend` (puerto 5173)

Nueva terminal:

```bash
cd frontend
npm run dev
```

Abre el navegador en: [http://localhost:5173](http://localhost:5173)

---

### Paso 4 — Primer uso (registro y verificación)

1. Entra a **Registrarse** (`/register`).
2. Usa un correo con dominio permitido (`gmail.com`, `hotmail.com`, `outlook.com`, `yahoo.com`, `live.com`, `icloud.com`, `utez.edu.mx`).
3. Tras registrarte, la cuenta queda **sin verificar** y no puedes iniciar sesión todavía.
4. Si no hay SMTP configurado, el enlace de verificación aparece:
   - en la **consola de `service-auth`**, y/o
   - en la pantalla de registro / en `/verificar-cuenta` al reenviar.
5. Abre el enlace o pega el token en [http://localhost:5173/verificar-cuenta](http://localhost:5173/verificar-cuenta).
6. Cuando diga que la cuenta está verificada, ve a **Login** e inicia sesión.
7. Cada usuario solo ve **su propio inventario**.

---

### Paso 5 — Comprobar que todo responde

| URL | Qué esperar |
| --- | --- |
| http://localhost:5173 | Landing / app |
| http://localhost:4003/health | JSON de health de reports |

Si el frontend no conecta, revisa que los tres backends estén arriba y que `frontend/.env` apunte a `4001`, `4002` y `4003`.

---

### Detener la app

En cada terminal: `Ctrl + C`.

---

## Variables de entorno

### `service-auth` (`.env.example`)

| Variable                 | Ejemplo                                     | Descripción                            |
| ------------------------ | ------------------------------------------- | -------------------------------------- |
| `AUTH_PORT`              | `4001`                                      | Puerto del servicio                    |
| `MONGO_URI`              | `mongodb://localhost:27017/inventario_auth` | MongoDB de usuarios                    |
| `JWT_SECRET`             | `changeme`                                  | Secreto para firmar JWT                |
| `FRONTEND_URL`           | `http://localhost:5173`                     | Base URL para enlaces de verificación  |
| `ALLOWED_EMAIL_DOMAINS`  | `gmail.com,hotmail.com,...`                 | Dominios permitidos al registrar       |
| `VERIFY_TOKEN_EXPIRES`   | `24h`                                       | Caducidad del JWT de verificación      |
| `SMTP_*` / `MAIL_FROM`   | (opcional)                                  | Sin SMTP, el enlace sale en consola    |

### `service-inventory` (`.env.example`)

| Variable          | Ejemplo                                          | Descripción                      |
| ----------------- | ------------------------------------------------ | -------------------------------- |
| `INVENTORY_PORT`  | `4002`                                           | Puerto del servicio              |
| `MONGO_URI`       | `mongodb://localhost:27017/inventario_inventory` | MongoDB de productos/movimientos |
| `JWT_SECRET`      | `changeme`                                       | Mismo secreto que auth           |

### `service-reports` (`.env.example`)

| Variable                 | Ejemplo                 | Descripción                   |
| ------------------------ | ----------------------- | ----------------------------- |
| `REPORTS_PORT`           | `4003`                  | Puerto del servicio           |
| `INVENTORY_SERVICE_URL`  | `http://localhost:4002` | Base URL de service-inventory |
| `JWT_SECRET`             | `changeme`              | Mismo secreto que auth        |

### `frontend` (`.env.example`)

| Variable              | Ejemplo                 | Descripción           |
| --------------------- | ----------------------- | --------------------- |
| `VITE_AUTH_URL`       | `http://localhost:4001` | Base URL de auth      |
| `VITE_INVENTORY_URL`  | `http://localhost:4002` | Base URL de inventory |
| `VITE_REPORTS_URL`    | `http://localhost:4003` | Base URL de reports   |

---

## Endpoints principales

### service-auth (`:4001`)

| Método | Ruta                         | Auth   | Descripción                                         |
| ------ | ---------------------------- | ------ | --------------------------------------------------- |
| POST   | `/auth/register`             | No     | Registrar (cuenta sin verificar; envía correo)      |
| POST   | `/auth/login`                | No     | Login → `{ token }` (bloquea si no está verificada) |
| POST   | `/auth/verify-email`         | No     | Body `{ token }` — activa la cuenta                 |
| POST   | `/auth/resend-verification`  | No     | Body `{ correo }` — reenvía enlace                  |
| GET    | `/auth/me`                   | Bearer | Usuario actual                                      |

### service-inventory (`:4002`)

| Método | Ruta             | Auth   | Descripción                             |
| ------ | ---------------- | ------ | --------------------------------------- |
| GET    | `/products`      | Bearer | Listar / buscar (`?nombre=&categoria=`) |
| POST   | `/products`      | Bearer | Crear producto                          |
| PUT    | `/products/:id`  | Bearer | Actualizar producto                     |
| DELETE | `/products/:id`  | Bearer | Soft delete (`activo: false`)           |
| POST   | `/entries`       | Bearer | Entrada de stock                        |
| POST   | `/outputs`       | Bearer | Salida de stock                         |

### service-reports (`:4003`)

| Método | Ruta                      | Auth   | Descripción                 |
| ------ | ------------------------- | ------ | --------------------------- |
| GET    | `/health`                 | No     | Health check                |
| GET    | `/alerts/low-stock`       | Bearer | Stock bajo (`?threshold=5`) |
| GET    | `/alerts/out-of-stock`    | Bearer | Sin stock                   |
| GET    | `/reports/summary`        | Bearer | Resumen de inventario       |
| GET    | `/reports/categories`     | Bearer | Agregado por categoría      |
| GET    | `/reports/top-products`   | Bearer | Top por valor (`?limit=5`)  |

## Frontend — rutas

| Ruta                 | Acceso    | Función                                    |
| -------------------- | --------- | ------------------------------------------ |
| `/login`             | Pública   | Iniciar sesión                             |
| `/register`          | Pública   | Crear cuenta (dominios permitidos)         |
| `/verificar-cuenta`  | Pública   | Validar cuenta con token JWT del correo    |
| `/dashboard`         | Protegida | Inicio / accesos rápidos                   |
| `/productos`         | Protegida | CRUD de productos                          |
| `/movimientos`       | Protegida | Entradas y salidas                         |
| `/alertas`           | Protegida | Stock bajo / agotado                       |
| `/reportes`          | Protegida | Resumen, categorías, top                   |

El JWT se guarda en `localStorage` (`ynventory-auth`). Sin token válido, las
rutas del panel redirigen a `/login`.

## Scripts npm

| Paquete             | `npm run dev`           | `npm start`          |
| ------------------- | ----------------------- | -------------------- |
| `service-auth`      | `nodemon src/server.js` | `node src/server.js` |
| `service-inventory` | `nodemon src/server.js` | `node src/server.js` |
| `service-reports`   | `nodemon src/index.js`  | `node src/index.js`  |
| `frontend`          | `vite` (HMR)            | `vite`               |

> El frontend usa Vite (no nodemon). Los tres backends usan nodemon en `dev`.
> Para build del frontend: `npm run build` y luego `npm run preview`.

## Estructura del monorepo

```
inventario-app/
  frontend/            # UI Ynventory
  service-auth/        # Auth + usuarios
  service-inventory/   # Productos + movimientos
  service-reports/     # Alertas + reportes (HTTP → inventory)
  .gitignore
  README.md
```
