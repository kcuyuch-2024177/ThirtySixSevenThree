const express = require('express');
const cors = require('cors');

const productRoutes = require('./routes/product.routes');
const movementRoutes = require('./routes/movement.routes');
const categoryRoutes = require('./routes/category.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);
app.use('/', movementRoutes);

app.use(errorHandler);

module.exports = app;
