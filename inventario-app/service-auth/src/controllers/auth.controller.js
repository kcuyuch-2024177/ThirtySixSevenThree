const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

const Usuario = require('../models/user.model');
const { sendVerificationEmail } = require('../services/mailer');

const MONGO_DUPLICATE_KEY_ERROR = 11000;
const VERIFY_PURPOSE = 'email_verification';

function createVerificationToken(usuario) {
  return jwt.sign(
    {
      purpose: VERIFY_PURPOSE,
      id: usuario._id,
      correo: usuario.correo,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.VERIFY_TOKEN_EXPIRES || '24h' },
  );
}

async function register(req, res, next) {
  try {
    const { nombre, correo, password } = req.body;
    const correoNormalizado = correo.trim().toLowerCase();

    const usuarioExistente = await Usuario.findOne({ correo: correoNormalizado });
    if (usuarioExistente) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un usuario registrado con ese correo',
      });
    }

    const passwordHasheado = await argon2.hash(password);

    const nuevoUsuario = await Usuario.create({
      nombre: nombre.trim(),
      correo: correoNormalizado,
      password: passwordHasheado,
      verificado: false,
    });

    const verificationToken = createVerificationToken(nuevoUsuario);
    const mailResult = await sendVerificationEmail({
      correo: nuevoUsuario.correo,
      nombre: nuevoUsuario.nombre,
      token: verificationToken,
    });

    const payload = {
      success: true,
      message:
        'Cuenta creada. Revisa tu correo para verificarla antes de iniciar sesión.',
      data: {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        correo: nuevoUsuario.correo,
        verificado: false,
        fechaCreacion: nuevoUsuario.fechaCreacion,
        emailSent: mailResult.sent,
      },
    };

    // En desarrollo sin SMTP, devolvemos el enlace para poder probar
    if (!mailResult.sent) {
      payload.data.verificationUrl = mailResult.verifyUrl;
    }

    return res.status(201).json(payload);
  } catch (error) {
    if (error.code === MONGO_DUPLICATE_KEY_ERROR) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un usuario registrado con ese correo',
      });
    }
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { correo, password } = req.body;
    const CREDENCIALES_INVALIDAS = {
      success: false,
      message: 'Credenciales inválidas',
    };

    const usuario = await Usuario.findOne({ correo: correo.trim().toLowerCase() });
    if (!usuario) {
      return res.status(401).json(CREDENCIALES_INVALIDAS);
    }

    const passwordValido = await argon2.verify(usuario.password, password);
    if (!passwordValido) {
      return res.status(401).json(CREDENCIALES_INVALIDAS);
    }

    // Solo bloquea cuentas nuevas (verificado: false). Usuarios antiguos sin el campo siguen entrando.
    if (usuario.verificado === false) {
      return res.status(403).json({
        success: false,
        code: 'EMAIL_NOT_VERIFIED',
        message:
          'Tu cuenta aún no está verificada. Revisa tu correo o solicita un nuevo enlace de verificación.',
      });
    }

    const token = jwt.sign(
      {
        id: usuario._id,
        correo: usuario.correo,
        nombre: usuario.nombre,
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' },
    );

    return res.status(200).json({ token });
  } catch (error) {
    return next(error);
  }
}

async function verifyEmail(req, res, next) {
  try {
    const { token } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'El token de verificación es obligatorio',
      });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({
        success: false,
        message: 'El enlace de verificación no es válido o ya expiró',
      });
    }

    if (payload.purpose !== VERIFY_PURPOSE || !payload.id) {
      return res.status(400).json({
        success: false,
        message: 'El token de verificación no es válido',
      });
    }

    const usuario = await Usuario.findById(payload.id);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    if (usuario.correo !== payload.correo) {
      return res.status(400).json({
        success: false,
        message: 'El token de verificación no coincide con la cuenta',
      });
    }

    if (usuario.verificado) {
      return res.status(200).json({
        success: true,
        message: 'La cuenta ya estaba verificada. Ya puedes iniciar sesión.',
        data: { verificado: true },
      });
    }

    usuario.verificado = true;
    await usuario.save();

    return res.status(200).json({
      success: true,
      message: 'Cuenta verificada correctamente. Ya puedes iniciar sesión.',
      data: {
        id: usuario._id,
        correo: usuario.correo,
        verificado: true,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function resendVerification(req, res, next) {
  try {
    const { correo } = req.body;

    if (!correo || typeof correo !== 'string' || !correo.trim()) {
      return res.status(400).json({
        success: false,
        campo: 'correo',
        message: 'El correo es obligatorio',
      });
    }

    const usuario = await Usuario.findOne({ correo: correo.trim().toLowerCase() });

    // Respuesta genérica para no filtrar si el correo existe
    const genericOk = {
      success: true,
      message: 'Si el correo existe y no está verificado, enviamos un nuevo enlace.',
    };

    if (!usuario || usuario.verificado) {
      return res.status(200).json(genericOk);
    }

    const verificationToken = createVerificationToken(usuario);
    const mailResult = await sendVerificationEmail({
      correo: usuario.correo,
      nombre: usuario.nombre,
      token: verificationToken,
    });

    const payload = { ...genericOk, data: { emailSent: mailResult.sent } };
    if (!mailResult.sent) {
      payload.data.verificationUrl = mailResult.verifyUrl;
    }

    return res.status(200).json(payload);
  } catch (error) {
    return next(error);
  }
}

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
        verificado: usuario.verificado,
        fechaCreacion: usuario.fechaCreacion,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { register, login, me, verifyEmail, resendVerification };
