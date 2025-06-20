const db = require('../config/db');
const bcrypt = require('bcrypt');

// Mostrar el formulario de login
const mostrarLogin = (req, res) => {
  res.render('login', { mensaje: null });
};

// Procesar el formulario de login
const procesarLogin = async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    // Buscar solo por correo
    const [rows] = await db.promise().query(
      'SELECT * FROM USUARIO WHERE correo = ?',
      [correo]
    );

    // Si no se encuentra el correo
    if (rows.length === 0) {
      return res.render('login', { mensaje: 'Correo o contraseña incorrectos' });
    }

    const usuario = rows[0];

    let esValida = false;

    if (usuario.contrasena.startsWith('$2b$')) {
      // Contraseña encriptada → usar bcrypt.compare
      esValida = await bcrypt.compare(contrasena, usuario.contrasena);
    } else {
      // Contraseña sin encriptar → comparar directo
      esValida = contrasena === usuario.contrasena;
    }

    if (esValida) {
      req.session.usuario = usuario;
      return res.redirect('/inicio');
    } else {
      return res.render('login', { mensaje: 'Correo o contraseña incorrectos' });
    }

  } catch (error) {
    console.error('Error al procesar login:', error);
    res.render('login', { mensaje: 'Error interno del servidor' });
  }
};

module.exports = { mostrarLogin, procesarLogin };
