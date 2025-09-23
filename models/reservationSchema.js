const { default: mongoose } = require("mongoose");

const reservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'userTBL', required: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'restaurantTbl', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  guests: { type: Number, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "pending"
  },
  createdAt: { type: Date, default: Date.now }
});

const Reservation = mongoose.model('reservationTbl', reservationSchema);

module.exports = Reservation;