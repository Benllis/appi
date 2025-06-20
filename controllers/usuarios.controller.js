// controllers/usuario.controller.js
const Usuario = require('../models/usuario.model');

// Página con lista de usuarios y sus roles
const renderUsuariosPage = async (req, res) => {
  try {
    const usuarios = await Usuario.obtenerUsuariosConRol();
    const roles = await Usuario.obtenerRoles();
    res.render('admin_usuarios', { usuarios, roles });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).send('Error al obtener los usuarios');
  }
};

const cambiarRolUsuario = async (req, res) => {
  const { id } = req.params;
  const { nuevo_rol_id } = req.body;

  try {
    await Usuario.actualizarRolUsuario(id, nuevo_rol_id);
    res.redirect('/admin/usuarios');
  } catch (error) {
    console.error('Error al cambiar rol:', error);
    res.status(500).send('Error al cambiar el rol');
  }
};

module.exports = {
  renderUsuariosPage,
  cambiarRolUsuario
};
