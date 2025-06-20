const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { checkRol } = require('../middlewares/auth');

// Vista de productos (tienda)
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
      JOIN (
        SELECT hp1.id_producto, hp1.valor
        FROM HISTORIAL_PRECIO hp1
        INNER JOIN (
          SELECT id_producto, MAX(fecha) AS fecha_max
          FROM HISTORIAL_PRECIO
          GROUP BY id_producto
        ) hp2 ON hp1.id_producto = hp2.id_producto AND hp1.fecha = hp2.fecha_max
      ) hp ON hp.id_producto = p.id_producto
      JOIN INVENTARIO i ON i.id_producto = p.id_producto
      WHERE i.stock >= 0
    `);

    res.render('tienda', { productos, usuario: req.session.usuario });
  } catch (error) {
    console.error('Error al cargar la tienda:', error);
    res.status(500).send('Error al cargar los productos');
  }
});

// Mostrar formulario para crear producto (solo admin)
router.get('/producto/nuevo', checkRol([1]), async (req, res) => {
  try {
    const [marcas] = await db.promise().query('SELECT * FROM MARCA');
    res.render('crearProducto', { usuario: req.session.usuario, marcas });
  } catch (error) {
    console.error('Error al cargar marcas:', error);
    res.status(500).send('Error al cargar formulario de producto');
  }
});

// Detalle de producto
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

// Eliminar producto (admin)
router.post('/producto/eliminar/:id', async (req, res) => {
  const { id } = req.params;
  const usuario = req.session.usuario;
  if (!usuario || usuario.id_rol !== 1) return res.status(403).send("No autorizado");

  try {
    await db.promise().query('UPDATE INVENTARIO SET stock = -1 WHERE id_producto = ?', [id]);
    res.redirect('/tienda');
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).send('Error al eliminar producto');
  }
});

// Editar producto (GET)
router.get('/producto/editar/:id', async (req, res) => {
  const id = req.params.id;
  const usuario = req.session.usuario;
  if (!usuario || usuario.id_rol !== 1) return res.status(403).send('No autorizado');

  try {
    const [rows] = await db.promise().query('SELECT * FROM PRODUCTO WHERE id_producto = ?', [id]);
    if (rows.length === 0) return res.status(404).send('Producto no encontrado');
    res.render('editarProducto', { producto: rows[0] });
  } catch (err) {
    return res.status(500).send('Error al obtener producto');
  }
});

// Editar producto (POST)
router.post('/producto/editar/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, categoria, subcategoria, id_marca, precio, stock } = req.body;
  const usuario = req.session.usuario;
  if (!usuario || usuario.id_rol !== 1) return res.status(403).send("No autorizado");

  try {
    await db.promise().query(`
      UPDATE PRODUCTO 
      SET nombre = ?, descripcion = ?, categoria = ?, subcategoria = ?, id_marca = ?
      WHERE id_producto = ?
    `, [nombre, descripcion, categoria, subcategoria, id_marca, id]);

    await db.promise().query(`
      INSERT INTO HISTORIAL_PRECIO (id_producto, valor, fecha) 
      VALUES (?, ?, NOW())
    `, [id, precio]);

    await db.promise().query(`
      UPDATE INVENTARIO SET stock = ? WHERE id_producto = ?
    `, [stock, id]);

    res.redirect('/tienda');
  } catch (err) {
    console.error('Error actualizando producto:', err);
    res.status(500).send("Error al actualizar producto");
  }
});


router.post('/producto/nuevo', checkRol([1]), async (req, res) => {
  const { nombre, descripcion, categoria, subcategoria, id_marca, nueva_marca, precio, stock, id_sucursal } = req.body;

  try {
    let marcaId = id_marca;

    // Si viene nueva marca, insertarla y obtener su id
    if (nueva_marca && nueva_marca.trim() !== '') {
      const [resultMarca] = await db.promise().query(`
        INSERT INTO MARCA (nombre) VALUES (?)
      `, [nueva_marca.trim()]);
      marcaId = resultMarca.insertId;
    }

    // Insertar producto con id_marca actualizado
    const [productoRes] = await db.promise().query(`
      INSERT INTO PRODUCTO (nombre, descripcion, categoria, subcategoria, id_marca)
      VALUES (?, ?, ?, ?, ?)
    `, [nombre, descripcion, categoria, subcategoria, marcaId || null]);

    const idProducto = productoRes.insertId;

    // Insertar precio en historial
    await db.promise().query(`
      INSERT INTO HISTORIAL_PRECIO (id_producto, valor, fecha)
      VALUES (?, ?, NOW())
    `, [idProducto, precio]);

    // Insertar stock en inventario (requiere id_sucursal)
    const sucursal = id_sucursal || 1; // Default a 1 si no viene en formulario
    await db.promise().query(`
      INSERT INTO INVENTARIO (id_producto, stock, id_sucursal)
      VALUES (?, ?, ?)
    `, [idProducto, stock, sucursal]);

    res.redirect('/tienda');
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).send('Error al crear producto');
  }
});

module.exports = router;