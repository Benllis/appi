const connection = require('../config/config');

const Producto = {
  getAll: () => {
    return new Promise((resolve, reject) => {
      connection.query(`
        SELECT p.*, m.nombre as marca_nombre 
        FROM PRODUCTO p
        LEFT JOIN MARCA m ON p.id_marca = m.id_marca
      `, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(`
        SELECT p.*, m.nombre as marca_nombre 
        FROM PRODUCTO p
        LEFT JOIN MARCA m ON p.id_marca = m.id_marca
        WHERE p.id_producto = ?
      `, [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      });
    });
  },

  create: (productoData) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'INSERT INTO PRODUCTO SET ?',
        [productoData],
        (err, results) => {
          if (err) return reject(err);
          resolve({ id: results.insertId, ...productoData });
        }
      );
    });
  },

  update: (id, updateData) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'UPDATE PRODUCTO SET ? WHERE id_producto = ?',
        [updateData, id],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.affectedRows > 0);
        }
      );
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'DELETE FROM PRODUCTO WHERE id_producto = ?',
        [id],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.affectedRows > 0);
        }
      );
    });
  },

  getByMarca: (marcaId) => {
    return new Promise((resolve, reject) => {
      connection.query(
        'SELECT * FROM PRODUCTO WHERE id_marca = ?',
        [marcaId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
  }
};

module.exports = Producto;