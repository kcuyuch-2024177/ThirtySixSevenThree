const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'service-reports' });
});

// TODO: montar rutas de reportes, ej: app.use('/api/reports', reportRoutes);
// Los datos de productos/stock se obtienen consultando service-inventory
// por HTTP (ver src/services/inventoryClient.js), sin modelos propios.

module.exports = app;
