const Producto = require('../models/producto.model');

module.exports = {
  getAllProducts: async (req, res) => {
    try {
      const productos = await Producto.getAll();
      res.json(productos);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener productos' });
    }
  },

  getProductById: async (req, res) => {
    try {
      const producto = await Producto.getById(req.params.id);
      if (!producto) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      res.json(producto);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener producto' });
    }
  },

  createProduct: async (req, res) => {
    try {
      const nuevoProducto = await Producto.create(req.body);
      res.status(201).json(nuevoProducto);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al crear producto' });
    }
  },

  updateProduct: async (req, res) => {
    try {
      const actualizado = await Producto.update(req.params.id, req.body);
      if (!actualizado) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      res.json({ message: 'Producto actualizado', id: req.params.id });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al actualizar producto' });
    }
  },

  deleteProduct: async (req, res) => {
    try {
      const eliminado = await Producto.delete(req.params.id);
      if (!eliminado) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      res.json({ message: 'Producto eliminado', id: req.params.id });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al eliminar producto' });
    }
  },

  getProductsByMarca: async (req, res) => {
    try {
      const productos = await Producto.getByMarca(req.params.marcaId);
      res.json(productos);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener productos por marca' });
    }
  }
};