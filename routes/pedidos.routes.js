const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidos.controller');

// CRUD de Pedidos
router.post('/', pedidosController.createPedido);
router.get('/:id', pedidosController.getPedido);
router.get('/usuario/:userId', pedidosController.getPedidosByUser);
router.put('/:id/estado', pedidosController.updatePedidoStatus);
router.delete('/:id', pedidosController.cancelPedido);

module.exports = router;