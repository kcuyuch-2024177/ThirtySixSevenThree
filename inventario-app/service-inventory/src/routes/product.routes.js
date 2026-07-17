const express = require('express');

const productController = require('../controllers/product.controller');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

// GET /products (protegido: requiere JWT válido)
router.get('/', verifyToken, productController.getProducts);

// POST /products (protegido: requiere JWT válido)
router.post('/', verifyToken, productController.createProduct);

module.exports = router;
