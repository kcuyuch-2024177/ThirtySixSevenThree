const express = require('express');

const reportController = require('../controllers/report.controller');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

// GET /reports/categories (protegido)
router.get('/categories', verifyToken, reportController.getCategoriesReport);

// GET /reports/summary (protegido)
router.get('/summary', verifyToken, reportController.getSummaryReport);

// GET /reports/top-products (protegido)
router.get('/top-products', verifyToken, reportController.getTopProductsReport);

module.exports = router;
