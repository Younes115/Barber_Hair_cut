const express = require ("express");
const router =  express.Router();

const verifyToken = require("../middleware/verifytoken");
const isAdminmiddleware = require("../middleware/isAdmin");
const booking =require("../model/booking");
const packageController= require("../controller/packageController");



router.get("/booking/today", verifyToken, isAdminmiddleware, async(req,res)=>{
    try {
        const today = new Date();
        today.setHours(0,0,0,0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate()+1);

        const dailyBooking = await booking.find({
            date:{
                $gte:today,
                $lt:tomorrow
            }
        }).populate('userId', 'name email');

        res.status(200).send(dailyBooking);
        
    } catch (err) {
          console.error('Error fetching daily bookings:', err);
        res.status(500).send('An error occurred while fetching bookings.');
    }

})

router.post("/package", verifyToken, isAdminmiddleware, packageController.addPackage);
router.put("/package/:id", verifyToken, isAdminmiddleware, packageController.updatePackage);
router.delete("/package/:id", verifyToken, isAdminmiddleware, packageController.deletePackage)



module.exports= router;
