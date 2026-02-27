const express = require("express");
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../model/User');
const verifyToken = require("../middleware/verifytoken");

const router = express.Router();

const clientId = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(clientId);
const jwtSecret = process.env.JWT_SECRET;

router.post("/google", async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(500).json({ message: "Google token is required" });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: clientId,
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name } = payload;

        let user = await User.findOne({ googleId });

        if (!user) {
            user = new User({
                googleId,
                email,
                name,
                role: email === process.env.ADMIN_EMAIL ? "admin" : "user"
            });
            await user.save();
        }


        const jwtToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: "login successful", jwtToken })

    } catch (err) {
        console.error('Authentication Error:', err);
        res.status(401).json({ message: "Authentication failed" });
    }
});

router.get("/profile", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ name: user.name, email: user.email, role: user.role });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch user profile" });
    }
});

module.exports = router;