const { default: mongoose } = require("mongoose");

const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    cuisine: { type: String, required: true }, 
    phone: { type: String },
    email: { type: String },
    description: { type: String },
    openingHours: { type: String }, 
    rating: { type: Number, min: 0, max: 5 },
    image: { type: String, default: "/uploads/restaurant-default.png" },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'userTBL', required: true },
    createdAt: { type: Date, default: Date.now }
});

const Restaurant = mongoose.model('restaurantTbl', restaurantSchema);

module.exports = Restaurant;

