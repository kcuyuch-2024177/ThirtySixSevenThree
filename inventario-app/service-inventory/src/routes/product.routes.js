const express = require('express');

const productController = require('../controllers/product.controller');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

// GET /products?nombre=&categoria= (protegido)
router.get('/', verifyToken, productController.getProducts);

// GET /products/:id (protegido)
router.get('/:id', verifyToken, productController.getProductById);

// POST /products (protegido)
router.post('/', verifyToken, productController.createProduct);

// PUT /products/:id (protegido)
router.put('/:id', verifyToken, productController.updateProduct);

// DELETE /products/:id (protegido, soft delete)
router.delete('/:id', verifyToken, productController.deleteProduct);

module.exports = router;
