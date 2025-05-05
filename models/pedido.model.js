const connection = require('../config/config');

const Pedido = {
  create: async (pedidoData) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'INSERT INTO PEDIDO SET ?',
        {
          ...pedidoData,
          fecha: new Date(),
          estado: 'pendiente'
        },
        (err, results) => {
          if (err) return reject(err);
          resolve(results.insertId); // Retorna el ID del nuevo pedido
        }
      );
    });
  },

  getById: async (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'SELECT * FROM PEDIDO WHERE id_pedido = ?',
        [id],
        (err, results) => {
          if (err) return reject(err);
          resolve(results[0] || null);
        }
      );
    });
  },

  getByUser: async (userId) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'SELECT * FROM PEDIDO WHERE id_usuario = ? ORDER BY fecha DESC',
        [userId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
  },

  updateStatus: async (id, newStatus) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'UPDATE PEDIDO SET estado = ? WHERE id_pedido = ?',
        [newStatus, id],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.affectedRows > 0);
        }
      );
    });
  }
};

module.exports = Pedido;