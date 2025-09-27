const express = require ("express");
const multer = require("multer");
const router =  express.Router();

const isAdminmiddleware = require("../middleware/isAdmin");
const booking =require("../model/booking");
const packageController= require("../controller/packageController");

const storge =multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"uploads/icons");
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+"-"+file.originalname);
    }
});

const upload = multer({storage:storge});



router.get("/booking/today",isAdminmiddleware,async(req,res)=>{
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

router.post("/package", isAdminmiddleware,upload.single('icon') ,packageController.addPackage);
router.put("/package/:id", isAdminmiddleware, packageController.updatePackage);
router.delete("/package/:id", isAdminmiddleware, packageController.deletePackage)



module.exports= router;
