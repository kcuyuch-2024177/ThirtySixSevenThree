const express = require('express');
const cors = require('cors');

const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const entryRoutes = require('./routes/entry.routes');
const outputRoutes = require('./routes/output.routes');
const movementRoutes = require('./routes/movement.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);
app.use('/entries', entryRoutes);
app.use('/outputs', outputRoutes);
app.use('/movements', movementRoutes);

// El middleware de errores va SIEMPRE al final, después de las rutas.
app.use(errorHandler);

module.exports = app;
