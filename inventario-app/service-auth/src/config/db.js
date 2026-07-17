const mongoose = require('mongoose');

// Se conecta a MongoDB forzando el nombre de base de datos "inventario_auth",
// sin importar si la MONGO_URI ya trae o no un nombre de base al final.
async function connectDB(mongoUri) {
  await mongoose.connect(mongoUri, {
    dbName: 'inventario_auth',
  });
  return mongoose.connection;
}

module.exports = { connectDB };
