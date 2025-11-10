/**
 * Orders Routes
 * REST API endpoints for managing production orders
 */

import { Router } from 'express';
import { ProductionOrder, OrderStatus } from '../../domain/entities/ProductionOrder';
import { RepositoryFactory } from '../../infrastructure/persistence/RepositoryFactory';

export const ordersRouter = Router();

// Get all orders
ordersRouter.get('/', async (req, res) => {
  try {
    const orderRepo = RepositoryFactory.createOrderRepository();
    const orders = await orderRepo.getAll();

    res.json({
      orders: orders.map(o => o.toJSON()),
      total: orders.length
    });
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

// Get orders by status
ordersRouter.get('/status/:status', async (req, res) => {
  try {
    const orderRepo = RepositoryFactory.createOrderRepository();
    const status = req.params.status as typeof OrderStatus[keyof typeof OrderStatus];

    const orders = await orderRepo.getByStatus(status);

    res.json({
      orders: orders.map(o => o.toJSON()),
      total: orders.length
    });
  } catch (error) {
    console.error('Error getting orders by status:', error);
    res.status(500).json({ error: 'Failed to get orders by status' });
  }
});

// Get pending orders sorted
ordersRouter.get('/pending', async (req, res) => {
  try {
    const orderRepo = RepositoryFactory.createOrderRepository();
    const orders = await orderRepo.getPendingOrdersSorted();

    res.json({
      orders: orders.map(o => o.toJSON()),
      total: orders.length
    });
  } catch (error) {
    console.error('Error getting pending orders:', error);
    res.status(500).json({ error: 'Failed to get pending orders' });
  }
});

// Get order by ID
ordersRouter.get('/:id', async (req, res) => {
  try {
    const orderRepo = RepositoryFactory.createOrderRepository();
    const order = await orderRepo.getById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order.toJSON());
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
});

// Create new order
ordersRouter.post('/', async (req, res) => {
  try {
    const orderRepo = RepositoryFactory.createOrderRepository();

    // Check if order already exists
    const exists = await orderRepo.exists(req.body.id);
    if (exists) {
      return res.status(409).json({ error: 'Order ID already exists' });
    }

    const order = ProductionOrder.create(req.body);
    await orderRepo.save(order);

    res.status(201).json(order.toJSON());
  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(400).json({ error: error.message || 'Failed to create order' });
  }
});

// Update order status
ordersRouter.patch('/:id/status', async (req, res) => {
  try {
    const orderRepo = RepositoryFactory.createOrderRepository();
    const { status } = req.body;

    const order = await orderRepo.getById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = order.withStatus(status);
    await orderRepo.save(updatedOrder);

    res.json(updatedOrder.toJSON());
  } catch (error: any) {
    console.error('Error updating order status:', error);
    res.status(400).json({ error: error.message || 'Failed to update order status' });
  }
});

// Delete order
ordersRouter.delete('/:id', async (req, res) => {
  try {
    const orderRepo = RepositoryFactory.createOrderRepository();

    const exists = await orderRepo.exists(req.params.id);
    if (!exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await orderRepo.delete(req.params.id);

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});
