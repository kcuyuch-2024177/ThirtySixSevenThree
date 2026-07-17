const express = require('express');

const authController = require('../controllers/auth.controller');
const { validateRegister, validateLogin } = require('../middlewares/validate');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

// POST /auth/register
router.post('/register', validateRegister, authController.register);

// POST /auth/login
router.post('/login', validateLogin, authController.login);

// GET /auth/me (ruta protegida: requiere un JWT válido en el header Authorization)
router.get('/me', verifyToken, authController.me);

module.exports = router;
