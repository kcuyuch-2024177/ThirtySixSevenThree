const express = require('express');

const movementController = require('../controllers/movement.controller');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

// GET /movements (protegido) — lista salidas crudas
router.get('/', verifyToken, movementController.getMovements);

module.exports = router;
