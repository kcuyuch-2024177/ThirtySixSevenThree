const express = require('express');

const authController = require('../controllers/auth.controller');
const { validateRegister, validateLogin } = require('../middlewares/validate');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.get('/me', verifyToken, authController.me);

module.exports = router;
