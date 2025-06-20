const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarios.controller');

router.get('/admin/usuarios', usuarioController.renderUsuariosPage);
router.post('/admin/usuarios/:id/cambiar-rol', usuarioController.cambiarRolUsuario);

module.exports = router;