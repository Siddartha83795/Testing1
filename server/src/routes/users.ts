import express from 'express';
import { User } from '../models/User';

const router = express.Router();

// Get Profile by Supabase User ID
router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.params.userId });
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

// Create/Update Profile
router.post('/', async (req, res) => {
    const { userId, email, name, role, phone, location } = req.body;

    try {
        let user = await User.findOne({ userId });

        if (user) {
            // Update existing
            user.email = email || user.email;
            user.name = name || user.name;
            user.role = role || user.role;
            user.phone = phone || user.phone;
            user.location = location || user.location;

            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            // Create new
            const newUser = new User({
                userId,
                email,
                name,
                role,
                phone,
                location
            });

            const savedUser = await newUser.save();
            res.json(savedUser);
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

export default router;
