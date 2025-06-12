const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarios.controller');

router.get('/', usuarioController.renderUsuariosPage); // GET /usuarios


module.exports = router;