const db = require('../config/db');

async function obtenerUsuarios() {
  const [rows] = await db.promise().query('SELECT * FROM USUARIO');
  console.log(rows);
  return rows;
}

module.exports = {
  obtenerUsuarios
};