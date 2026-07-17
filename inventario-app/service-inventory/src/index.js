require('dotenv').config();

const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 4002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/inventario-inventory';

async function start() {
  try {
    await connectDB(MONGO_URI);
    console.log('service-inventory: conectado a MongoDB');

    app.listen(PORT, () => {
      console.log(`service-inventory escuchando en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('service-inventory: error al iniciar', error.message);
    process.exit(1);
  }
}

start();
