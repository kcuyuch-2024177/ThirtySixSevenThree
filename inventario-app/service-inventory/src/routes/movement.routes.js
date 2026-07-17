const express = require('express');

const movementController = require('../controllers/movement.controller');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

router.post('/entries', verifyToken, movementController.createEntry);
router.post('/outputs', verifyToken, movementController.createOutput);
router.get('/movements', verifyToken, movementController.getMovements);

module.exports = router;
