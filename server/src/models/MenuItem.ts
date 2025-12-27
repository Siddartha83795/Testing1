import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
    // We can keep a custom string ID or let Mongo use _id. 
    // For compatibility with frontend expecting string IDs, we can map _id to id.
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: '/placeholder.svg',
    },
    location: {
        type: String,
        enum: ['medical', 'bitbites'],
        required: true,
    },
    available: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

export const MenuItem = mongoose.model('MenuItem', menuItemSchema);
