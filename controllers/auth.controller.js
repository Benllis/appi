const db = require('../config/db');

// Mostrar el formulario de login
const mostrarLogin = (req, res) => {
  res.render('login', { mensaje: null });
};

// Procesar el formulario de login
const procesarLogin = async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM USUARIO WHERE correo = ? AND contrasena = ?',
      [correo, contrasena]
    );

    if (rows.length > 0) {
        req.session.usuario = rows[0];
        res.redirect('/inicio');
    } else {
        res.render('login', { mensaje: 'Correo o contraseña incorrectos' });
    }
  } catch (error) {
        console.error('Error al procesar login:', error);
        res.render('login', { mensaje: 'Error interno del servidor' });
  }
};

module.exports = { mostrarLogin, procesarLogin };

