require('dotenv').config();

const app = require('./app');
const { connectDB } = require('./config/db');

// Puerto configurable por variable de entorno, 4001 por defecto.
const PORT = process.env.AUTH_PORT || 4001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/inventario_auth';

async function start() {
  try {
    await connectDB(MONGO_URI);
    console.log('Conectado a MongoDB (inventario_auth)');

    app.listen(PORT, () => {
      console.log(`service-auth escuchando en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar service-auth:', error.message);
    process.exit(1);
  }
}

start();
