const express = require("express");
const router = express.Router();
const booking = require("../model/booking");
const verifyToken = require("../middleware/verifytoken");

router.post("/", verifyToken, async (req, res) => {
    const { name, email, date, time, phone, services } = req.body;
    const userId = req.userId;

    // Corrected validation check for required fields and empty services array
    if (!name || !email || !date || !time || !phone || !Array.isArray(services) || services.length === 0) {
        return res.status(400).json({ message: "All fields are required" });
    }
    try {
        const bookingCount = await booking.countDocuments({
            date: new Date(date),
            time: time
        });
        if (bookingCount >= 2) {
            return res.status(400).json({ message: "This time slot is fully booked. Please choose another time." });
        }
        let newBooking = new booking({
            userId,
            name,
            email,
            date,
            time,
            phone,
            services
        });
        await newBooking.save();
        res.status(200).json({ message: "booking successful", booking: newBooking });
    } catch (err) {
        console.error("Booking error:", err);
        res.status(500).json({ message: "Failed to create booking", error: err.message });
    }
});






module.exports =router;