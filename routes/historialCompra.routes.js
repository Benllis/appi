const express = require('express');
const router = express.Router();
const historialController = require('../controllers/historialCompra.controller');

router.post('/', historialController.registrarAccion);

router.get('/usuario/:usuarioId', historialController.getByUsuario);
router.get('/', historialController.getAll); // Para administradores

module.exports = router;