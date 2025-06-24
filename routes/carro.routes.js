const express = require('express');
const router = express.Router();
const db = require('../config/db');
const axios = require('axios');
const qs = require('qs');

// Agregar producto al carrito
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
      req.session.carro.push({
        id_producto: producto.id_producto,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: cantidadNum
      });
    }

    res.redirect('/carro/ver');
  } catch (error) {
    console.error('Error al agregar al carro:', error);
    res.status(500).send('Error interno al agregar producto');
  }
});

// Ver carrito (con último precio actualizado)
router.get('/carro/ver', async (req, res) => {
  const mensaje_error = req.session.mensaje_error;
  req.session.mensaje_error = null;
  if (!req.session.carro || req.session.carro.length === 0) {
    return res.render('carro', { carrito: [], total: 0, usuario: req.session.usuario });
  }

  try {
    const carrito = req.session.carro;
    const nuevosCarrito = [];

    for (const item of carrito) {
      const [rows] = await db.promise().query(`
        SELECT valor FROM HISTORIAL_PRECIO
        WHERE id_producto = ?
        ORDER BY fecha DESC
        LIMIT 1
      `, [item.id_producto]);

      const nuevoPrecio = rows.length > 0 ? rows[0].valor : item.precio;
      nuevosCarrito.push({ ...item, precio: nuevoPrecio });
    }

    const total = nuevosCarrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    
    res.render('carro', {
      carrito: nuevosCarrito,
      total,
      usuario: req.session.usuario,
      mensaje_error
    });
  } catch (error) {
    console.error('Error al mostrar el carrito:', error);
    res.status(500).send('Error al mostrar el carrito');
  }
});

// Quitar producto del carrito
router.post('/carro/quitar/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (req.session.carro) {
    req.session.carro = req.session.carro.filter(p => p.id_producto !== id);
  }
  res.redirect('/carro/ver');
});

// Vaciar carrito
router.post('/carro/vaciar', (req, res) => {
  req.session.carro = [];
  res.redirect('/carro/ver');
});

// Confirmar compra (inicia pago)
router.post('/confirmar', async (req, res) => {
  if (!req.session.usuario || !req.session.carro || req.session.carro.length === 0) {
    return res.redirect('/login');
  }

  const carrito = req.session.carro;
  const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const retiro_domicilio = req.body.retiro_domicilio === '1' ? '1' : '0';

  try {
    const response = await axios.post(
      'http://localhost:5000/payment',
      qs.stringify({ amount: total }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    req.session.retiro_domicilio = retiro_domicilio;
    res.redirect(response.request.res.responseUrl);
  } catch (error) {
    console.error('Error al conectar con Transbank:', error);
    res.status(500).send('No se pudo iniciar el pago');
  }
});

// Confirmar pago desde Transbank
router.get('/webpay/confirmar', async (req, res) => {
  const token = req.query.token_ws;
  if (!token) return res.status(400).send("Token faltante");

  if (!req.session.usuario || !req.session.carro || req.session.carro.length === 0) {
    return res.status(400).send("No hay usuario o carrito para confirmar");
  }

  try {
    const { data } = await axios.post('http://localhost:5000/webpay/commit', { token_ws: token });

    if (data.status === 'AUTHORIZED') {
      const userId = req.session.usuario.id_usuario;
      const carrito = req.session.carro;
      const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
      const retiroDomicilio = req.session.retiro_domicilio === '1' ? 1 : 0;

      const conn = await db.promise().getConnection();
      try {
        await conn.beginTransaction();

        let idDespacho = null;
        if (retiroDomicilio === 1) {
          const [direccionRows] = await conn.query(
            `SELECT id_direccion FROM USUARIO WHERE id_usuario = ?`,
            [userId]
          );
          const direccionId = direccionRows[0]?.id_direccion;
          if (!direccionId) throw new Error('Dirección no encontrada');

          const [despachoRes] = await conn.query(
            `INSERT INTO DESPACHO (id_direccion) VALUES (?)`,
            [direccionId]
          );
          idDespacho = despachoRes.insertId;
        }

        const [pagoResult] = await conn.query(`
          INSERT INTO PAGO (confirmado_por_contador, id_estado, id_tp_pago)
          VALUES (0, (SELECT id_estado FROM ESTADO WHERE name_estado = 'Pagado'), 1)
        `);
        const idPago = pagoResult.insertId;

        const [pedido] = await conn.query(`
          INSERT INTO PEDIDO (id_usuario, fecha, monto_total, id_estado, retiro_domicilio, id_pago, id_despacho)
          VALUES (?, NOW(), ?, (SELECT id_estado FROM ESTADO WHERE name_estado = 'Pagado'), ?, ?, ?)
        `, [userId, total, retiroDomicilio, idPago, idDespacho]);
        const idPedido = pedido.insertId;

        for (const item of carrito) {
          await conn.query(`
            INSERT INTO DETALLE_PEDIDO (id_pedido, id_producto, cantidad, precio_unitario)
            VALUES (?, ?, ?, ?)
          `, [idPedido, item.id_producto, item.cantidad, item.precio]);

          await conn.query(`
            UPDATE INVENTARIO SET stock = stock - ? WHERE id_producto = ?
          `, [item.cantidad, item.id_producto]);
        }

        await conn.commit();
        req.session.carro = [];
        req.session.retiro_domicilio = null;
        req.session.mensaje_exito = '¡Tu compra se ha realizado con éxito!';
        return res.redirect('/mis-pedidos');

      } catch (err) {
        await conn.rollback();
        console.error('Error al registrar pedido:', err);
        return res.status(500).send('Error al registrar el pedido');
      } finally {
        conn.release();
      }

    } else {
      return res.status(400).send('Pago rechazado o no autorizado');
    }

  } catch (error) {
    console.error('Error al confirmar Transbank:', error);
    return res.status(500).send('No se pudo confirmar el pago');
  }
});

// Ver pedidos del usuario
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

    const mensaje = req.session.mensaje_exito;
    req.session.mensaje_exito = null;

    res.render('mis_pedidos', { pedidos, detallesPorPedido, mensaje });

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

router.get('/webpay/anulado', (req, res) => {
  req.session.mensaje_error = 'La compra fue anulada por el usuario.';
  return res.redirect('/carro/ver');
});


module.exports = router;
