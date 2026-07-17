const express = require('express');
const cors = require('cors');

const alertRoutes = require('./routes/alert.routes');
const reportRoutes = require('./routes/report.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/alerts', alertRoutes);
app.use('/reports', reportRoutes);

// El middleware de errores va SIEMPRE al final, después de las rutas.
app.use(errorHandler);

module.exports = app;
