const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventario.controller');

router.get('/', inventarioController.getAll);
router.get('/producto/:productoId', inventarioController.getByProducto);
router.get('/sucursal/:sucursalId', inventarioController.getBySucursal);
router.post('/', inventarioController.create);
router.put('/:id/stock', inventarioController.updateStock);

module.exports = router;