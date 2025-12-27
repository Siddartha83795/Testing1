import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { MenuItem } from './models/MenuItem';

dotenv.config();

const medicalCafeteriaMenu = [
    {
        name: 'Healthy Veg Thali',
        description: 'Nutritious meal with dal, rice, roti, and seasonal vegetables',
        price: 120,
        category: 'food',
        image: '/placeholder.svg',
        location: 'medical',
        available: true,
    },
    {
        name: 'Grilled Chicken Salad',
        description: 'Fresh greens with grilled chicken and light dressing',
        price: 150,
        category: 'food',
        image: '/placeholder.svg',
        location: 'medical',
        available: true,
    },
    {
        name: 'Soup of the Day',
        description: 'Warm, comforting soup with bread roll',
        price: 60,
        category: 'food',
        image: '/placeholder.svg',
        location: 'medical',
        available: true,
    },
    {
        name: 'Fresh Fruit Juice',
        description: 'Seasonal fresh pressed juice',
        price: 45,
        category: 'drink',
        image: '/placeholder.svg',
        location: 'medical',
        available: true,
    },
    {
        name: 'Green Smoothie',
        description: 'Spinach, banana, apple and honey blend',
        price: 70,
        category: 'drink',
        image: '/placeholder.svg',
        location: 'medical',
        available: true,
    },
    {
        name: 'Protein Bar',
        description: 'Healthy snack bar with nuts and dates',
        price: 35,
        category: 'snack',
        image: '/placeholder.svg',
        location: 'medical',
        available: true,
    },
];

const bitBitesMenu = [
    {
        name: 'Classic Burger',
        description: 'Juicy beef patty with fresh veggies and special sauce',
        price: 149,
        category: 'food',
        image: '/placeholder.svg',
        location: 'bitbites',
        available: true,
    },
    {
        name: 'Crispy Chicken Wrap',
        description: 'Crunchy chicken with lettuce and ranch',
        price: 129,
        category: 'food',
        image: '/placeholder.svg',
        location: 'bitbites',
        available: true,
    },
    {
        name: 'Loaded Fries',
        description: 'Crispy fries with cheese and bacon bits',
        price: 99,
        category: 'snack',
        image: '/placeholder.svg',
        location: 'bitbites',
        available: true,
    },
    {
        name: 'Cappuccino',
        description: 'Rich espresso with steamed milk foam',
        price: 79,
        category: 'drink',
        image: '/placeholder.svg',
        location: 'bitbites',
        available: true,
    },
    {
        name: 'Cold Coffee',
        description: 'Iced coffee blended with cream',
        price: 89,
        category: 'drink',
        image: '/placeholder.svg',
        location: 'bitbites',
        available: true,
    },
    {
        name: 'Chocolate Brownie',
        description: 'Warm fudgy brownie with ice cream',
        price: 109,
        category: 'snack',
        image: '/placeholder.svg',
        location: 'bitbites',
        available: true,
    },
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log('MongoDB Connected');

        // Clear existing menu items
        await MenuItem.deleteMany({});
        console.log('Cleared existing menu items');

        // Insert new items
        await MenuItem.insertMany([...medicalCafeteriaMenu, ...bitBitesMenu]);
        console.log('Menu items seeded successfully');

        process.exit();
    } catch (error) {
        console.error(`Error: ${(error as Error).message}`);
        process.exit(1);
    }
};

seedDB();
