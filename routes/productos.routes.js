const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productos.controller');

router.get('/', productosController.getAllProducts);
router.get('/:id', productosController.getProductById);
router.post('/', productosController.createProduct);
router.put('/:id', productosController.updateProduct);
router.delete('/:id', productosController.deleteProduct);
router.get('/marca/:marcaId', productosController.getProductsByMarca);

module.exports = router;