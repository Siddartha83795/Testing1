import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
    },
    user_id: {
        type: String, // Supabase Auth ID
        required: false,
    },
    location: {
        type: String,
        enum: ['medical', 'bitbites'],
        required: true,
    },
    items: [
        {
            id: String,
            name: String,
            price: Number,
            quantity: Number,
        }
    ],
    total: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'],
        default: 'pending',
    },
    client_name: {
        type: String,
        required: true,
    },
    client_phone: {
        type: String,
    },
    table_number: {
        type: String,
    },
}, {
    timestamps: true,
});

export const Order = mongoose.model('Order', orderSchema);
