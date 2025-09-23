const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'restaurantTbl', required: true },
    name: { type: String, required: true },
    description: String,
    price: Number,
    category: {
        type: String,
        enum: ['Indian', 'Chinese', 'Italian', 'Mexican', 'Cafe'],
        required: true
    },
    image: { type: String, default: "/uploads/menu-default.png" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'userTBL', required: true },
    createdAt: { type: Date, default: Date.now }

}, {
    timestamps: true
})

const Menu = mongoose.model('menuTbl', menuSchema);

module.exports = Menu;