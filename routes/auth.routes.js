const db = require('../config/db');
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { checkRol } = require('../middlewares/auth');
const bcrypt = require('bcrypt');

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


router.post('/actualizar-estado/:id', checkRol([1, 2]), async (req, res) => {
  const idPedido = req.params.id;
  const nuevoEstado = req.body.nuevo_estado;
  const rolUsuario = req.session.usuario.id_rol;

  try {
    // Validaciones
    if (rolUsuario === 2 && nuevoEstado !== 'Pendiente') {
      return res.status(403).send('El vendedor solo puede cambiar a Pendiente');
    }

    // Actualizar el estado
    await db.promise().query(`
      UPDATE PEDIDO 
      SET id_estado = (SELECT id_estado FROM ESTADO WHERE name_estado = ?)
      WHERE id_pedido = ?
    `, [nuevoEstado, idPedido]);

    res.redirect('/gestion-pedidos');
  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).send('Error al actualizar estado');
  }
});

router.get('/gestion-pedidos', checkRol([1, 2]), async (req, res) => {
  try {
    const [pedidos] = await db.promise().query(`
      SELECT p.id_pedido, p.fecha, p.monto_total, e.name_estado, u.pnombre, u.appaterno
      FROM PEDIDO p
      JOIN ESTADO e ON p.id_estado = e.id_estado
      JOIN USUARIO u ON p.id_usuario = u.id_usuario
      ORDER BY p.fecha DESC
    `);

    res.render('gestion_pedidos', { pedidos, usuario: req.session.usuario });
  } catch (error) {
    console.error('Error cargando pedidos:', error);
    res.status(500).send('Error al cargar los pedidos');
  }
});

router.get('/registro', async (req, res) => {
  try {
    const [regiones] = await db.promise().query('SELECT id_region, name_region FROM REGION ORDER BY name_region');
    const [comunas] = await db.promise().query('SELECT id_comuna, name_comuna FROM COMUNA ORDER BY name_comuna');
    res.render('registro', { regiones, comunas, mensaje: '' });
  } catch (error) {
    console.error('Error cargando registro:', error);
    res.status(500).send('Error interno del servidor');
  }
});

router.post('/registro', async (req, res) => {
  try {
    const {
      pnombre,
      snombre,
      appaterno,
      apmaterno,
      correo,
      contrasena,
      rut,
      fecha_nac,
      region_id,
      comuna_id,
      direccion
    } = req.body;

    // Validar campos obligatorios (ajusta según tus necesidades)
    if (!pnombre || !appaterno || !apmaterno || !correo || !contrasena || !rut || !fecha_nac || !region_id || !comuna_id || !direccion) {
      return res.status(400).render('registro', { mensaje: 'Por favor complete todos los campos obligatorios.' });
    }

    // Validar si correo o rut ya existen
    const [existing] = await db.promise().query(
      'SELECT * FROM USUARIO WHERE correo = ? OR rut = ?',
      [correo, rut]
    );

    if (existing.length > 0) {
      return res.status(400).render('registro', { mensaje: 'Correo o RUT ya están registrados.' });
    }

    // Insertar nueva dirección y obtener su id
    const [resultDireccion] = await db.promise().query(
      `INSERT INTO DIRECCION (id_region, id_comuna, direccion) VALUES (?, ?, ?)`,
      [region_id, comuna_id, direccion]
    );
    const id_direccion = resultDireccion.insertId;

    // Hashear contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

    // Asignar rol 3 (cliente) fijo
    const id_rol = 3;

    // Insertar nuevo usuario con id_direccion e id_rol
    await db.promise().query(
      `INSERT INTO USUARIO 
       (pnombre, snombre, appaterno, apmaterno, correo, contrasena, rut, fecha_nac, id_direccion, id_rol)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [pnombre, snombre || null, appaterno, apmaterno, correo, hashedPassword, rut, fecha_nac, id_direccion, id_rol]
    );

    // Registro exitoso
    res.redirect('/login');
  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).render('registro', { mensaje: 'Error interno del servidor' });
  }
});

module.exports = router;