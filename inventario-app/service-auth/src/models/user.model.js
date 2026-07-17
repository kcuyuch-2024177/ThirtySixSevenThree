const mongoose = require('mongoose');

// Esquema del usuario que se guarda en la colección "users".
// El password NUNCA se guarda en texto plano: siempre llega aquí ya
// hasheado con argon2 (ver auth.controller.js).
const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
  },
  correo: {
    type: String,
    required: [true, 'El correo es obligatorio'],
    unique: true, // no puede haber dos usuarios con el mismo correo
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
  },
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
});

// "users" es el nombre de la colección en Mongo (Mongoose lo pluraliza,
// pero lo dejamos explícito aquí para que quede claro).
module.exports = mongoose.model('Usuario', userSchema, 'users');
