const Marca = require('../models/marca.model');

module.exports = {
    getAllMarcas: async (req, res) => {
        try {
            const marcas = await Marca.getAll();
            res.json(marcas);
        } catch (error) {
            console.error('Error al obtener marcas:', error);
            res.status(500).json({ error: 'Error al obtener marcas' });
        }
    },

    getMarcaById: async (req, res) => {
        try {
            const marca = await Marca.getById(req.params.id);
            if (!marca) {
                return res.status(404).json({ error: 'Marca no encontrada' });
            }
            res.json(marca);
        } catch (error) {
            console.error('Error al obtener marca:', error);
            res.status(500).json({ error: 'Error al obtener marca' });
        }
    },

    createMarca: async (req, res) => {
        try {
            const nuevaMarca = await Marca.create(req.body);
            res.status(201).json(nuevaMarca);
        } catch (error) {
            console.error('Error al crear marca:', error);
            res.status(500).json({ error: 'Error al crear marca' });
        }
    },

    updateMarca: async (req, res) => {
        try {
            const actualizado = await Marca.update(req.params.id, req.body);
            if (!actualizado) {
                return res.status(404).json({ error: 'Marca no encontrada' });
            }
            res.json({ message: 'Marca actualizada', id: req.params.id });
        } catch (error) {
            console.error('Error al actualizar marca:', error);
            res.status(500).json({ error: 'Error al actualizar marca' });
        }
    },

    deleteMarca: async (req, res) => {
        try {
            const eliminado = await Marca.delete(req.params.id);
            if (!eliminado) {
                return res.status(404).json({ error: 'Marca no encontrada' });
            }
            res.json({ message: 'Marca eliminada', id: req.params.id });
        } catch (error) {
            console.error('Error al eliminar marca:', error);
            res.status(500).json({ error: 'Error al eliminar marca' });
        }
    }
};