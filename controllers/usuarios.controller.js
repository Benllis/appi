const Usuario = require('../models/usuario.model');

const renderUsuariosPage = async (req, res) => {
  try {
    const usuarios = await Usuario.obtenerUsuarios(); // ← usa el nombre correcto
    res.render('usuario', { usuarios }); // asegúrate que la vista sea 'usuarios.ejs'
  } catch (error) {
    console.error('Error al obtener usuarios 1:', error);
    res.status(500).send('Error al obtener los usuarios IDK');
  }
};

module.exports = {
  renderUsuariosPage,
  // otros controladores...
};