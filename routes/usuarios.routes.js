const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller'); 

router.get('/', usuariosController.getAllUsers);
router.get('/:id', usuariosController.getUserById);
router.post('/', usuariosController.createUser);
router.put('/:id', usuariosController.updateUser);
router.delete('/:id', usuariosController.deleteUser);

module.exports = router;