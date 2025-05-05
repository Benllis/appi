const connection = require('../config/config');

const Usuario = {
    // Obtener todos los usuarios
    getAll: () => {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM USUARIO', (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    },

    // Obtener por ID
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

    // Crear usuario
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

    // Actualizar usuario
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

    // Eliminar usuario
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