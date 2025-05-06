const connection = require('../config/config');

const Usuario = {
    getAll: () => {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM USUARIO', (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    },

    getById: (id) => {
        return new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM USUARIO WHERE id_usuario = ?', 
                [id], 
                (err, results) => {
                    if (err) return reject(err);
                    resolve(results[0] || null);
                }
            );
        });
    },

    create: (userData) => {
        return new Promise((resolve, reject) => {
            connection.query(
                'INSERT INTO USUARIO SET ?',
                [userData],
                (err, results) => {
                    if (err) return reject(err);
                    resolve({ id: results.insertId, ...userData });
                }
            );
        });
    },

    update: (id, userData) => {
        return new Promise((resolve, reject) => {
            connection.query(
                'UPDATE USUARIO SET ? WHERE id_usuario = ?',
                [userData, id],
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
                'DELETE FROM USUARIO WHERE id_usuario = ?',
                [id],
                (err, results) => {
                    if (err) return reject(err);
                    resolve(results.affectedRows > 0);
                }
            );
        });
    }
};

module.exports = Usuario;