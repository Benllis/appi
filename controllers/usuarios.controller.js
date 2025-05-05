const Usuario = require('../models/usuario.model');

module.exports = {
    getAllUsers: async (req, res) => {
        try {
            const users = await Usuario.getAll();
            res.json(users);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getUserById: async (req, res) => {
        try {
            const user = await Usuario.getById(req.params.id);
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            res.json(user);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    createUser: async (req, res) => {
        try {
            const newUser = await Usuario.create(req.body);
            res.status(201).json(newUser);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    updateUser: async (req, res) => {
        try {
            const updated = await Usuario.update(req.params.id, req.body);
            if (!updated) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            res.json({ message: 'Usuario actualizado' });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    deleteUser: async (req, res) => {
        try {
            const deleted = await Usuario.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            res.json({ message: 'Usuario eliminado' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};