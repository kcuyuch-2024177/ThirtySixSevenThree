const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

const Usuario = require('../models/user.model');

// Código de error de Mongo/Mongoose cuando se viola un índice "unique"
// (por ejemplo, el correo). Se usa como red de seguridad ante una
// condición de carrera: dos registros con el mismo correo casi al
// mismo tiempo, que pasan el findOne() antes de que el otro termine de crear.
const MONGO_DUPLICATE_KEY_ERROR = 11000;

// POST /auth/register
// Crea un nuevo usuario. Valida que el correo no exista, hashea la
// contraseña con argon2 y responde con el usuario creado (sin el hash).
async function register(req, res, next) {
  try {
    const { nombre, correo, password } = req.body;

    // 1. Verificar que el correo no esté ya registrado
    const usuarioExistente = await Usuario.findOne({ correo });
    if (usuarioExistente) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un usuario registrado con ese correo',
      });
    }

    // 2. Hashear la contraseña (nunca se guarda en texto plano)
    const passwordHasheado = await argon2.hash(password);

    // 3. Crear el usuario en la base de datos
    const nuevoUsuario = await Usuario.create({
      nombre,
      correo,
      password: passwordHasheado,
    });

    // 4. Responder 201 sin devolver el hash de la contraseña
    return res.status(201).json({
      success: true,
      data: {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        correo: nuevoUsuario.correo,
        fechaCreacion: nuevoUsuario.fechaCreacion,
      },
    });
  } catch (error) {
    // Red de seguridad: si por una condición de carrera Mongo rechaza el
    // insert por índice único duplicado, respondemos 409 igual que arriba
    // en vez de dejar que caiga como error 500 genérico.
    if (error.code === MONGO_DUPLICATE_KEY_ERROR) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un usuario registrado con ese correo',
      });
    }

    // Cualquier otro error se delega al middleware centralizado (errorHandler.js)
    return next(error);
  }
}

// POST /auth/login
// Verifica las credenciales del usuario y, si son correctas, devuelve un JWT.
async function login(req, res, next) {
  try {
    const { correo, password } = req.body;

    // Mensaje genérico a propósito: no decimos si falló el correo o el
    // password, para no darle pistas a quien intenta adivinar credenciales.
    const CREDENCIALES_INVALIDAS = {
      success: false,
      message: 'Credenciales inválidas',
    };

    // 1. Buscar el usuario por correo
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(401).json(CREDENCIALES_INVALIDAS);
    }

    // 2. Verificar la contraseña contra el hash guardado
    const passwordValido = await argon2.verify(usuario.password, password);
    if (!passwordValido) {
      return res.status(401).json(CREDENCIALES_INVALIDAS);
    }

    // 3. Generar el JWT con los datos básicos del usuario
    const token = jwt.sign(
      {
        id: usuario._id,
        correo: usuario.correo,
        nombre: usuario.nombre,
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // 4. Responder con el token
    return res.status(200).json({ token });
  } catch (error) {
    return next(error);
  }
}

// GET /auth/me
// Ruta protegida (requiere el middleware verifyToken). Devuelve los datos
// del usuario autenticado, identificado por req.user.id (payload del JWT).
async function me(req, res, next) {
  try {
    const usuario = await Usuario.findById(req.user.id).select('-password');

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        fechaCreacion: usuario.fechaCreacion,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { register, login, me };
