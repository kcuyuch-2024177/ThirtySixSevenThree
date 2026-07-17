const express = require('express');

const movementController = require('../controllers/movement.controller');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

// POST /outputs (protegido)
router.post('/', verifyToken, movementController.createOutput);

module.exports = router;
