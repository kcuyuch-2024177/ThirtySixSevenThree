require('dotenv').config();

const app = require('./app');

// Puerto configurable por variable de entorno, 4003 por defecto.
const PORT = process.env.REPORTS_PORT || 4003;

app.listen(PORT, () => {
  console.log(`service-reports escuchando en el puerto ${PORT}`);
});
