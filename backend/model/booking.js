const mongoose = require("mongoose");
const { Schema } = mongoose;

const bookingSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String, 
        required: true,
    },
    phone: {
        type: String, 
        required: true,
        
    },
    services: [{
        name: {
            type: String,
            required: true
        },
         price: {
            type: Number,
            required: true
        }
    }]
});

module.exports = mongoose.model("Booking", bookingSchema);