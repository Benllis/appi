function checkRol(rolesPermitidos) {
  return (req, res, next) => {
    const usuario = req.session.usuario;
    if (!usuario || !rolesPermitidos.includes(usuario.id_rol)) {
      return res.status(403).send('No tienes permisos para acceder');
    }
    next();
  };
}

module.exports = { checkRol };
