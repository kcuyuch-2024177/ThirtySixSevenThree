const express = require('express');

const productController = require('../controllers/product.controller');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

// GET /categories (protegido)
router.get('/', verifyToken, productController.getCategories);

module.exports = router;
