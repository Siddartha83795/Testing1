import express from 'express';
import { Order } from '../models/Order';

const router = express.Router();

// Get All Orders (Admin/Staff)
router.get('/', async (req, res) => {
    try {
        const { location, user_id, status } = req.query;

        let query: any = {};

        if (location) query.location = location;
        if (user_id) query.user_id = user_id;
        if (status) {
            // If status is an array (e.g. ?status=pending&status=ready) - Express handles this, likely need 'in'
            // Simple string check for now.
            query.status = status;
        }

        const orders = await Order.find(query).sort({ createdAt: -1 });
        // Map _id to id for frontend compatibility
        const formattedOrders = orders.map(order => ({
            ...order.toObject(),
            id: order._id
        }));

        res.json(formattedOrders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Create Order
router.post('/', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();
        res.json({
            ...savedOrder.toObject(),
            id: savedOrder._id
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating order', error });
    }
});

// Update Order Status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (order) {
            order.status = status;
            const updatedOrder = await order.save();
            res.json({
                ...updatedOrder.toObject(),
                id: updatedOrder._id
            });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating order' });
    }
});

export default router;
