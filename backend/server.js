const express = require('express');
const mongoose = require("mongoose")
const path = require("path");
require('dotenv').config();
const cors = require('cors');
// يجب أن يكون هذا السطر قبل تعريف أي مسارات

const authRouter = require("./routers/auth")
const bookRouter= require("./routers/book");
const adminRouter = require("./routers/admin");
const packageController = require("./controller/packageController"); // استيراد المتحكم

const app = express();

app.use(cors()); 
app.use(express.json());


app.use(express.static(path.join(__dirname, "frontend")));


app.get('/config', (req, res) => {
    res.json({
        googleClientId: process.env.GOOGLE_CLIENT_ID
    });
});

app.use("/api/auth", authRouter);
app.use("/api/booking", bookRouter);
app.use("/api/admin", adminRouter);
// تصحيح: استدعاء الدالة المحددة من المتحكم
app.get("/api/packages", packageController.getPackages);


mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("connected to database");
    })
    .catch(err => console.error('Could not connect to MongoDB', err))


app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});