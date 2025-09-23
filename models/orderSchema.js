const { default: mongoose } = require("mongoose");

// --- Order Item (subdocument) ---
const orderItemSchema = new mongoose.Schema({
  menu: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'menuTbl', 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true, 
    default: 1,
    min: 1
  }
}, { _id: false }); // ✅ unnecessary _id nahi banega har item ke liye

// --- Main Order Schema ---
const orderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'userTBL', 
    required: true 
  },
  restaurant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'restaurantTbl', 
    required: true 
  },
  items: {
    type: [orderItemSchema],
    validate: {
      validator: (val) => Array.isArray(val) && val.length > 0,
      message: 'Order must have at least one item.'
    }
  },
  total: { 
    type: Number, 
    required: true, 
    default: 0,
    min: 0
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });  // ✅ auto add createdAt & updatedAt

// --- Model ---
const Order = mongoose.model('orderTbl', orderSchema);

module.exports = Order;
