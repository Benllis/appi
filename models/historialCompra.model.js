const connection = require('../config/config');

const HistorialCompra = {
  create: (historialData) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'INSERT INTO HISTORIAL_DE_COMPRA SET ?',
        {
          ...historialData,
          fecha: new Date()
        },
        (err, results) => {
          if (err) return reject(err);
          resolve(results.insertId);
        }
      );
    });
  },

  getByUsuario: (usuarioId) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT h.*, p.nombre as producto_nombre 
         FROM HISTORIAL_DE_COMPRA h
         LEFT JOIN PEDIDO pe ON h.id_pedido = pe.id_pedido
         LEFT JOIN DETALLE_PEDIDO dp ON pe.id_pedido = dp.id_pedido
         LEFT JOIN PRODUCTO p ON dp.id_producto = p.id_producto
         WHERE h.id_usuario = ?
         ORDER BY h.fecha DESC`,
        [usuarioId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
  },

  getAll: () => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT h.*, u.pnombre as usuario_nombre 
         FROM HISTORIAL_DE_COMPRA h
         JOIN USUARIO u ON h.id_usuario = u.id_usuario
         ORDER BY h.fecha DESC`,
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
  }
};

module.exports = HistorialCompra;