const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Ver productos en tienda
router.get('/tienda', async (req, res) => {
  try {
    const [productos] = await db.promise().query(`
      SELECT 
        p.id_producto,
        p.nombre,
        p.descripcion,
        p.categoria,
        p.subcategoria,
        m.nombre AS marca,
        hp.valor AS precio,
        i.stock
      FROM PRODUCTO p
      JOIN MARCA m ON p.id_marca = m.id_marca
      JOIN HISTORIAL_PRECIO hp ON hp.id_producto = p.id_producto
      JOIN INVENTARIO i ON i.id_producto = p.id_producto
    `);
    res.render('tienda', { productos, usuario: req.session.usuario });
  } catch (error) {
    console.error('Error al cargar la tienda:', error);
    res.status(500).send('Error al cargar los productos');
  }
});

// Detalle producto
router.get('/producto/:id', async (req, res) => {
  const idProducto = req.params.id;

  try {
    const [producto] = await db.promise().query(`
      SELECT 
        p.id_producto,
        p.nombre,
        p.descripcion,
        p.categoria,
        p.subcategoria,
        m.nombre AS marca,
        hp.valor AS precio,
        i.stock
      FROM PRODUCTO p
      JOIN MARCA m ON p.id_marca = m.id_marca
      JOIN HISTORIAL_PRECIO hp ON hp.id_producto = p.id_producto
      JOIN INVENTARIO i ON i.id_producto = p.id_producto
      WHERE p.id_producto = ?
      ORDER BY hp.fecha DESC
      LIMIT 1
    `, [idProducto]);

    if (producto.length === 0) return res.status(404).send('Producto no encontrado');
    res.render('producto', { producto: producto[0], usuario: req.session.usuario });
  } catch (error) {
    console.error('Error al cargar detalles del producto:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// Carrito
router.post('/carro/agregar', async (req, res) => {
  const { id_producto, cantidad } = req.body;
  const cantidadNum = parseInt(cantidad);

  if (!req.session.usuario) return res.redirect('/login');
  if (!req.session.carro) req.session.carro = [];

  try {
    const [rows] = await db.promise().query(`
      SELECT 
        p.id_producto, p.nombre, hp.valor AS precio, i.stock
      FROM PRODUCTO p
      JOIN HISTORIAL_PRECIO hp ON p.id_producto = hp.id_producto
      JOIN INVENTARIO i ON p.id_producto = i.id_producto
      WHERE p.id_producto = ?
      ORDER BY hp.fecha DESC
      LIMIT 1
    `, [id_producto]);

    if (rows.length === 0) return res.status(404).send('Producto no encontrado');

    const producto = rows[0];
    if (producto.stock < cantidadNum) return res.status(400).send('No hay suficiente stock');

    const index = req.session.carro.findIndex(item => item.id_producto === producto.id_producto);
    if (index >= 0) {
      req.session.carro[index].cantidad += cantidadNum;
    } else {
      req.session.carro.push({ id_producto: producto.id_producto, nombre: producto.nombre, precio: producto.precio, cantidad: cantidadNum });
    }

    res.redirect('/carro/ver');
  } catch (error) {
    console.error('Error al agregar al carro:', error);
    res.status(500).send('Error interno al agregar producto');
  }
});

router.get('/carro/ver', (req, res) => {
  const carrito = req.session.carro || [];
  const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  res.render('carro', { carrito, total, usuario: req.session.usuario });
});

router.post('/carro/quitar/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (req.session.carro) {
    req.session.carro = req.session.carro.filter(p => p.id_producto !== id);
  }
  res.redirect('/carro/ver');
});

router.post('/carro/vaciar', (req, res) => {
  req.session.carro = [];
  res.redirect('/carro/ver');
});

// Confirmar compra
router.post('/confirmar', async (req, res) => {
  if (!req.session.usuario || !req.session.carro || req.session.carro.length === 0) {
    return res.redirect('/login');
  }

  const userId = req.session.usuario.id_usuario;
  const carrito = req.session.carro;
  let total = 0;
  carrito.forEach(p => total += p.precio * p.cantidad);

  const conn = await db.promise().getConnection();
  try {
    await conn.beginTransaction();

    const [pedido] = await conn.query(`
      INSERT INTO PEDIDO (id_usuario, fecha, monto_total, id_estado)
      VALUES (?, NOW(), ?, (SELECT id_estado FROM ESTADO WHERE name_estado = 'Pendiente'))
    `, [userId, total]);

    const idPedido = pedido.insertId;

    for (const item of carrito) {
      await conn.query(`
        INSERT INTO DETALLE_PEDIDO (id_pedido, id_producto, cantidad, precio_unitario)
        VALUES (?, ?, ?, ?)
      `, [idPedido, item.id_producto, item.cantidad, item.precio]);

      await conn.query(`UPDATE INVENTARIO SET stock = stock - ? WHERE id_producto = ?`, [item.cantidad, item.id_producto]);
    }

    await conn.commit();
    req.session.carro = [];
    res.redirect('/mis-pedidos');
  } catch (err) {
    await conn.rollback();
    console.error('Error al confirmar compra:', err);
    res.status(500).send('Error al confirmar la compra');
  } finally {
    conn.release();
  }
});

// Mis pedidos
router.get('/mis-pedidos', async (req, res) => {
  if (!req.session.usuario) return res.redirect('/login');

  const userId = req.session.usuario.id_usuario;
  try {
    const [pedidos] = await db.promise().query(`
      SELECT p.id_pedido, p.fecha, p.monto_total, ep.name_estado
      FROM PEDIDO p
      JOIN ESTADO ep ON p.id_estado = ep.id_estado
      WHERE p.id_usuario = ?
      ORDER BY p.fecha DESC
    `, [userId]);

    const detallesPorPedido = {};
    for (const pedido of pedidos) {
      const [detalles] = await db.promise().query(`
        SELECT dp.cantidad, dp.precio_unitario, pr.nombre
        FROM DETALLE_PEDIDO dp
        JOIN PRODUCTO pr ON dp.id_producto = pr.id_producto
        WHERE dp.id_pedido = ?
      `, [pedido.id_pedido]);
      detallesPorPedido[pedido.id_pedido] = detalles;
    }

    res.render('mis_pedidos', { pedidos, detallesPorPedido });
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    res.status(500).send('Error interno al obtener pedidos');
  }
});

// Cancelar pedido
router.post('/cancelar-pedido/:id', async (req, res) => {
  if (!req.session.usuario) return res.redirect('/login');

  const idPedido = req.params.id;
  const userId = req.session.usuario.id_usuario;

  try {
    const [rows] = await db.promise().query(`
      SELECT * FROM PEDIDO 
      WHERE id_pedido = ? AND id_usuario = ? AND id_estado = (
        SELECT id_estado FROM ESTADO WHERE name_estado = 'Pendiente'
      )
    `, [idPedido, userId]);

    if (rows.length === 0) return res.status(403).send('No se puede cancelar este pedido.');

    await db.promise().query(`
      UPDATE PEDIDO 
      SET id_estado = (SELECT id_estado FROM ESTADO WHERE name_estado = 'Cancelado')
      WHERE id_pedido = ?
    `, [idPedido]);

    res.redirect('/mis-pedidos');
  } catch (error) {
    console.error('Error al cancelar pedido:', error);
    res.status(500).send('Error al cancelar el pedido');
  }
});

module.exports = router;
