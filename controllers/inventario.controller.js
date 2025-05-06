const Inventario = require('../models/inventario.model');

module.exports = {
  getAll: async (req, res) => {
    try {
      const inventario = await Inventario.getAll();
      res.json(inventario);
    } catch (error) {
      console.error('Error al obtener inventario:', error);
      res.status(500).json({ error: 'Error al obtener inventario' });
    }
  },

  getByProducto: async (req, res) => {
    try {
      const inventario = await Inventario.getByProducto(req.params.productoId);
      res.json(inventario);
    } catch (error) {
      console.error('Error al obtener inventario por producto:', error);
      res.status(500).json({ error: 'Error al obtener inventario por producto' });
    }
  },

  getBySucursal: async (req, res) => {
    try {
      const inventario = await Inventario.getBySucursal(req.params.sucursalId);
      res.json(inventario);
    } catch (error) {
      console.error('Error al obtener inventario por sucursal:', error);
      res.status(500).json({ error: 'Error al obtener inventario por sucursal' });
    }
  },

  updateStock: async (req, res) => {
    try {
      const { nuevaCantidad } = req.body;
      const actualizado = await Inventario.updateStock(
        req.params.id, 
        nuevaCantidad
      );

      if (!actualizado) {
        return res.status(404).json({ error: 'Registro de inventario no encontrado' });
      }

      res.json({ 
        message: 'Stock actualizado',
        id: req.params.id,
        nuevaCantidad
      });
    } catch (error) {
      console.error('Error al actualizar stock:', error);
      res.status(500).json({ error: 'Error al actualizar stock' });
    }
  },

  create: async (req, res) => {
    try {
      const nuevoId = await Inventario.create(req.body);
      res.status(201).json({
        id: nuevoId,
        ...req.body
      });
    } catch (error) {
      console.error('Error al crear registro de inventario:', error);
      res.status(500).json({ error: 'Error al crear registro de inventario' });
    }
  }
};