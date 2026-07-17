require('dotenv').config();

const app = require('./app');
const { connectDB } = require('./config/db');

// Puerto configurable por variable de entorno, 4002 por defecto.
const PORT = process.env.INVENTORY_PORT || 4002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/inventario_inventory';

async function start() {
  try {
    await connectDB(MONGO_URI);
    console.log('Conectado a MongoDB (inventario_inventory)');

    app.listen(PORT, () => {
      console.log(`service-inventory escuchando en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar service-inventory:', error.message);
    process.exit(1);
  }
}

start();
