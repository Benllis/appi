const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller'); // Importa el objeto

// Define rutas
router.get('/', usuariosController.getAllUsers);       // GET /api/usuarios
router.get('/:id', usuariosController.getUserById);   // GET /api/usuarios/:id
router.post('/', usuariosController.createUser);      // POST /api/usuarios
router.put('/:id', usuariosController.updateUser);
router.delete('/:id', usuariosController.deleteUser);

module.exports = router;