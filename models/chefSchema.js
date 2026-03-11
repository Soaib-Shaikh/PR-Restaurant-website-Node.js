const mongoose = require("mongoose");

const chefSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    speciality: {
        type: String
    },

    experience: {
        type: Number
    },

    image: {
        type: String
    },

    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant"
    }

}, { timestamps: true });

module.exports = mongoose.model("Chef", chefSchema);