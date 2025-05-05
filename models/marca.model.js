const connection = require('../config/config');

const Marca = {

    getAll: () => {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM MARCA', (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    },
    getById: (id) => {
        return new Promise((resolve, reject) => {
            connection.query(
                'SELECT * FROM MARCA WHERE id_marca = ?', 
                [id], 
                (err, results) => {
                    if (err) return reject(err);
                    resolve(results[0] || null);
                }
            );
        });
    },


    create: (marcaData) => {
        return new Promise((resolve, reject) => {
            connection.query(
                'INSERT INTO MARCA SET ?',
                [marcaData],
                (err, results) => {
                    if (err) return reject(err);
                    resolve({ id: results.insertId, ...marcaData });
                }
            );
        });
    },


    update: (id, updateData) => {
        return new Promise((resolve, reject) => {
            connection.query(
                'UPDATE MARCA SET ? WHERE id_marca = ?',
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
                'DELETE FROM MARCA WHERE id_marca = ?',
                [id],
                (err, results) => {
                    if (err) return reject(err);
                    resolve(results.affectedRows > 0);
                }
            );
        });
    }
};

module.exports = Marca;