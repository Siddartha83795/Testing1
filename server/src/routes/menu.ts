import express from 'express';
import { MenuItem } from '../models/MenuItem';

const router = express.Router();

// Get Menu Items
router.get('/', async (req, res) => {
    try {
        const { location } = req.query;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = { available: true };

        if (location) {
            query.location = location;
        }

        const items = await MenuItem.find(query);
        const formattedItems = items.map(item => ({
            ...item.toObject(),
            id: item._id
        }));

        res.json(formattedItems);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Create Menu Item (Seeding/Admin)
router.post('/', async (req, res) => {
    try {
        const newItem = new MenuItem(req.body);
        const savedItem = await newItem.save();
        res.json(savedItem);
    } catch (error) {
        res.status(500).json({ message: 'Error creating menu item' });
    }
});

export default router;
