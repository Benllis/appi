const connection = require('../config/config');

const DetallePedido = {
  create: async (detalleData) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'INSERT INTO DETALLE_PEDIDO SET ?',
        detalleData,
        (err, results) => {
          if (err) return reject(err);
          resolve(results.insertId);
        }
      );
    });
  },

  getByPedido: async (pedidoId) => {
    return new Promise((resolve, reject) => {
      connection.query(
        `SELECT dp.*, p.nombre as producto_nombre, p.descripcion 
         FROM DETALLE_PEDIDO dp
         JOIN PRODUCTO p ON dp.id_producto = p.id_producto
         WHERE dp.id_pedido = ?`,
        [pedidoId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
  },

  deleteByPedido: async (pedidoId) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'DELETE FROM DETALLE_PEDIDO WHERE id_pedido = ?',
        [pedidoId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.affectedRows > 0);
        }
      );
    });
  }
};

module.exports = DetallePedido;