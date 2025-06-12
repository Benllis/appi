const db = require('../config/db');
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.get('/login', authController.mostrarLogin);
router.post('/login', authController.procesarLogin);

router.get('/perfil', async (req, res) => {
  if (!req.session.usuario) return res.redirect('/login');

  try {
    const userId = req.session.usuario.id_usuario;
    const [rows] = await db.promise().query(`
      SELECT d.direccion AS direccion,
        c.name_comuna AS comuna,
        r.name_region AS region
      FROM USUARIO u
      JOIN DIRECCION d ON u.id_direccion = d.id_direccion
      JOIN COMUNA c ON d.id_comuna = c.id_comuna
      JOIN REGION r ON c.id_region = r.id_region
      WHERE u.id_usuario = ?
    `, [userId]);

    res.render('perfil', {
      usuario: req.session.usuario,
      direccion: rows[0]
    });
  } catch (error) {
    console.error('Error al obtener la dirección:', error);
    res.status(500).send('Error interno del servidor');
  }
});

router.get('/inicio', (req, res) => {
  if (!req.session.usuario) return res.redirect('/login');
  res.render('inicio', { usuario: req.session.usuario });
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      return res.status(500).send('Error al cerrar sesión');
    }
    res.redirect('/login');
  });
});

module.exports = router;