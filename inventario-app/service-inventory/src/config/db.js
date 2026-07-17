const mongoose = require('mongoose');

async function connectDB(mongoUri) {
  await mongoose.connect(mongoUri);
  return mongoose.connection;
}

module.exports = { connectDB };
