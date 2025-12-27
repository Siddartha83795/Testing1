import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true, // Corresponds to Supabase Auth ID
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['client', 'staff', 'admin'],
        default: 'client',
    },
    phone: {
        type: String,
    },
    location: {
        type: String,
        enum: ['medical', 'bitbites'],
    },
}, {
    timestamps: true,
});

export const User = mongoose.model('User', userSchema);
