const express = require('express');
const cors = require('cors');

const alertsRoutes = require('./routes/alerts.routes');
const reportsRoutes = require('./routes/reports.routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'service-reports' });
});

app.use('/alerts', alertsRoutes);
app.use('/reports', reportsRoutes);

app.use(errorHandler);

module.exports = app;
