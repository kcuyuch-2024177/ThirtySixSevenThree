const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// Todas las rutas de autenticación quedan bajo el prefijo /auth
app.use('/auth', authRoutes);

// El middleware de errores va SIEMPRE al final, después de las rutas.
app.use(errorHandler);

module.exports = app;
