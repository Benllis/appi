const connection = require('../config/config');

const Inventario = {
  getAll: () => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT i.*, p.nombre as producto_nombre, s.nombre as sucursal_nombre 
         FROM INVENTARIO i
         JOIN PRODUCTO p ON i.id_producto = p.id_producto
         JOIN SUCURSAL s ON i.id_sucursal = s.id_sucursal`,
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
  },

  getByProducto: (productoId) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT i.*, s.nombre as sucursal_nombre 
         FROM INVENTARIO i
         JOIN SUCURSAL s ON i.id_sucursal = s.id_sucursal
         WHERE i.id_producto = ?`,
        [productoId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
  },

  getBySucursal: (sucursalId) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT i.*, p.nombre as producto_nombre 
         FROM INVENTARIO i
         JOIN PRODUCTO p ON i.id_producto = p.id_producto
         WHERE i.id_sucursal = ?`,
        [sucursalId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
  },

  updateStock: (id, nuevaCantidad) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'UPDATE INVENTARIO SET cantidad = ? WHERE id_inventario = ?',
        [nuevaCantidad, id],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.affectedRows > 0);
        }
      );
    });
  },

  create: (inventarioData) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'INSERT INTO INVENTARIO SET ?',
        inventarioData,
        (err, results) => {
          if (err) return reject(err);
          resolve(results.insertId);
        }
      );
    });
  }
};

module.exports = Inventario;