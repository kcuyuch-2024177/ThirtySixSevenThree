const express = require('express');

const reportsController = require('../controllers/reports.controller');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

router.get('/summary', verifyToken, reportsController.getSummary);
router.get('/categories', verifyToken, reportsController.getCategories);
router.get('/top-products', verifyToken, reportsController.getTopProducts);

module.exports = router;
