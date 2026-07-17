const express = require('express');

const alertController = require('../controllers/alert.controller');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

// GET /alerts/low-stock (protegido)
router.get('/low-stock', verifyToken, alertController.getLowStockAlerts);

// GET /alerts/out-of-stock (protegido)
router.get('/out-of-stock', verifyToken, alertController.getOutOfStockAlerts);

module.exports = router;
