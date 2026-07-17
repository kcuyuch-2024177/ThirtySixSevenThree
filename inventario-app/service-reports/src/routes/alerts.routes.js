const express = require('express');

const alertsController = require('../controllers/alerts.controller');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

router.get('/low-stock', verifyToken, alertsController.getLowStock);
router.get('/out-of-stock', verifyToken, alertsController.getOutOfStock);

module.exports = router;
