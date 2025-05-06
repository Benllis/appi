const HistorialCompra = require('../models/historialCompra.model');

module.exports = {
  registrarAccion: async (req, res) => {
    try {
      const { id_usuario, descripcion, id_pedido } = req.body;
      const nuevoRegistro = await HistorialCompra.create({
        id_usuario,
        descripcion,
        id_pedido
      });
      
      res.status(201).json({
        id: nuevoRegistro,
        mensaje: 'Acción registrada en el historial'
      });
    } catch (error) {
      console.error('Error al registrar en historial:', error);
      res.status(500).json({ error: 'Error al registrar en historial' });
    }
  },

  getByUsuario: async (req, res) => {
    try {
      const historial = await HistorialCompra.getByUsuario(req.params.usuarioId);
      res.json(historial);
    } catch (error) {
      console.error('Error al obtener historial:', error);
      res.status(500).json({ error: 'Error al obtener historial' });
    }
  },

  getAll: async (req, res) => {
    try {
      const historial = await HistorialCompra.getAll();
      res.json(historial);
    } catch (error) {
      console.error('Error al obtener historial completo:', error);
      res.status(500).json({ error: 'Error al obtener historial completo' });
    }
  }
};