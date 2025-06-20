// models/usuario.model.js
const db = require('../config/db');

// Obtener todos los usuarios con su nombre de rol
async function obtenerUsuariosConRol() {
  const [rows] = await db.promise().query(`
    SELECT u.*, r.name_rol 
    FROM USUARIO u
    JOIN ROL r ON u.id_rol = r.id_rol
  `);
  return rows;
}

// Obtener lista de roles
async function obtenerRoles() {
  const [rows] = await db.promise().query(`SELECT * FROM ROL`);
  return rows;
}

// Cambiar el rol de un usuario
async function actualizarRolUsuario(id_usuario, nuevo_rol_id) {
  await db.promise().query(`UPDATE USUARIO SET id_rol = ? WHERE id_usuario = ?`, [nuevo_rol_id, id_usuario]);
}

module.exports = {
  obtenerUsuariosConRol,
  obtenerRoles,
  actualizarRolUsuario
};
