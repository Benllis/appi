const Pedido = require('../models/pedido.model');
const DetallePedido = require('../models/detallePedido.model');

module.exports = {
  createPedido: async (req, res) => {
    const transaction = await connection.promise().beginTransaction();
    
    try {
      // 1. Crear el pedido principal
      const { id_usuario, items, ...pedidoData } = req.body;
      const pedidoId = await Pedido.create({
        ...pedidoData,
        id_usuario
      });

      // 2. Crear cada item del detalle
      for (const item of items) {
        await DetallePedido.create({
          id_pedido: pedidoId,
          id_producto: item.id_producto,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          despacho: item.despacho || false
        });
      }

      // 3. Confirmar la transacción
      await transaction.commit();

      // 4. Obtener y devolver el pedido completo
      const pedidoCompleto = await Pedido.getById(pedidoId);
      const detalles = await DetallePedido.getByPedido(pedidoId);

      res.status(201).json({
        ...pedidoCompleto,
        items: detalles
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error al crear pedido:', error);
      res.status(500).json({ error: 'Error al crear pedido', details: error.message });
    }
  },

  getPedido: async (req, res) => {
    try {
      const pedido = await Pedido.getById(req.params.id);
      if (!pedido) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }

      const detalles = await DetallePedido.getByPedido(req.params.id);
      res.json({
        ...pedido,
        items: detalles
      });

    } catch (error) {
      console.error('Error al obtener pedido:', error);
      res.status(500).json({ error: 'Error al obtener pedido' });
    }
  },

  getPedidosByUser: async (req, res) => {
    try {
      const pedidos = await Pedido.getByUser(req.params.userId);
      
      // Obtener detalles para cada pedido
      const pedidosCompletos = await Promise.all(
        pedidos.map(async (pedido) => {
          const detalles = await DetallePedido.getByPedido(pedido.id_pedido);
          return {
            ...pedido,
            items: detalles
          };
        })
      );

      res.json(pedidosCompletos);
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      res.status(500).json({ error: 'Error al obtener pedidos' });
    }
  },

  updatePedidoStatus: async (req, res) => {
    try {
      const { nuevoEstado } = req.body;
      const actualizado = await Pedido.updateStatus(req.params.id, nuevoEstado);

      if (!actualizado) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }

      res.json({ 
        message: 'Estado del pedido actualizado', 
        id: req.params.id,
        nuevoEstado 
      });
    } catch (error) {
      console.error('Error al actualizar pedido:', error);
      res.status(500).json({ error: 'Error al actualizar pedido' });
    }
  },

  cancelPedido: async (req, res) => {
    const transaction = await connection.promise().beginTransaction();
    
    try {
      // 1. Eliminar detalles primero (por restricciones de clave foránea)
      await DetallePedido.deleteByPedido(req.params.id);
      
      // 2. Eliminar el pedido
      const eliminado = await Pedido.delete(req.params.id);
      
      if (!eliminado) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }

      await transaction.commit();
      res.json({ message: 'Pedido cancelado', id: req.params.id });

    } catch (error) {
      await transaction.rollback();
      console.error('Error al cancelar pedido:', error);
      res.status(500).json({ error: 'Error al cancelar pedido' });
    }
  }
};