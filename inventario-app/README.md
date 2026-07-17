# inventario-app

Monorepo del sistema de gestión de inventario. Contiene el frontend y los
microservicios de backend, cada uno con su propio `package.json`
independiente (sin herramientas de monorepo como Turborepo, Nx o Lerna).

## Descripción

Sistema para gestionar inventario, autenticación de usuarios y generación de
reportes. Está compuesto por un frontend y tres servicios de backend
independientes que se comunican entre sí por HTTP.

## Estructura del proyecto

```
inventario-app/
  frontend/            # Vite + React (se inicializará más adelante)
  service-auth/        # Node.js + Express + Mongoose
  service-inventory/   # Node.js + Express + Mongoose
  service-reports/     # Node.js + Express (consume service-inventory por HTTP)
```

## Servicios

| Servicio           | Stack                       | Descripción                                                |
| ------------------- | ---------------------------- | ------------------------------------------------------------ |
| `frontend`          | Vite + React                 | Interfaz de usuario (pendiente de inicializar).             |
| `service-auth`      | Node.js + Express + Mongoose | Registro, login y gestión de usuarios/roles.                 |
| `service-inventory` | Node.js + Express + Mongoose | Gestión de productos, categorías y stock.                    |
| `service-reports`   | Node.js + Express             | Genera reportes consumiendo `service-inventory` vía HTTP.     |

## Cómo ejecutar

> Placeholders: se completarán cuando cada servicio tenga sus dependencias
> instaladas y su configuración final.

### frontend

```bash
cd frontend
# TODO: npm install
# TODO: npm run dev
```

### service-auth

```bash
cd service-auth
# TODO: npm install
# TODO: configurar .env (ver .env.example)
# TODO: npm run dev
```

### service-inventory

```bash
cd service-inventory
# TODO: npm install
# TODO: configurar .env (ver .env.example)
# TODO: npm run dev
```

### service-reports

```bash
cd service-reports
# TODO: npm install
# TODO: configurar .env (ver .env.example)
# TODO: npm run dev
```
