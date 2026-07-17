const express = require('express');
const cors = require('cors');

const productRoutes = require('./routes/product.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// Todas las rutas de productos quedan bajo el prefijo /products
app.use('/products', productRoutes);

// El middleware de errores va SIEMPRE al final, después de las rutas.
app.use(errorHandler);

module.exports = app;
