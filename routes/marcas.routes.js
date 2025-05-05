const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidos.controller');

router.post('/', pedidosController.createPedido);
router.get('/:id', pedidosController.getPedido);
router.get('/usuario/:userId', pedidosController.getPedidosByUser);
router.put('/:id/estado', pedidosController.updatePedidoStatus);

module.exports = router;