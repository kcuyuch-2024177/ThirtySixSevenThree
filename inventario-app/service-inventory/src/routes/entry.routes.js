const express = require('express');

const movementController = require('../controllers/movement.controller');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

// POST /entries (protegido)
router.post('/', verifyToken, movementController.createEntry);

module.exports = router;
