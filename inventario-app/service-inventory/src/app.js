const express = require('express');
const cors = require('cors');

const productRoutes = require('./routes/product.routes');
const movementRoutes = require('./routes/movement.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/products', productRoutes);
app.use('/', movementRoutes);

// El middleware de errores va SIEMPRE al final, después de las rutas.
app.use(errorHandler);

module.exports = app;
