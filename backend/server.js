const express = require('express');
const mongoose = require("mongoose")
const path = require("path");
require('dotenv').config();
const cors = require('cors');
const rateLimit = require('express-rate-limit');


const authRouter = require("./routers/auth")
const bookRouter= require("./routers/book");
const adminRouter = require("./routers/admin");
const packageController = require("./controller/packageController");

const app = express();

// --- CORS: allow production domain + any localhost origin for dev ---
const allowedOrigins = [
    'https://barberhaircut-production.up.railway.app'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        // Allow any localhost origin (any port) for development
        if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token']
}));

// --- Rate Limiting: moderate limit on booking creation ---
const bookingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,                  // 20 requests per window per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many booking attempts from this IP, please try again later.' }
});
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(express.static(path.join(__dirname, "frontend")));


app.get('/config', (req, res) => {
    res.json({
        googleClientId: process.env.GOOGLE_CLIENT_ID
    });
});

app.use("/api/auth", authRouter);
app.use("/api/booking", bookingLimiter, bookRouter);
app.use("/api/admin", adminRouter);
app.get("/api/packages", packageController.getPackages);


mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("connected to database");
    })
    .catch(err => console.error('Could not connect to MongoDB', err))


app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});