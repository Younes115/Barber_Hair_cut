const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
        // accept Authorization or authorization, also allow x-access-token
        const header = req.headers.authorization || req.headers.Authorization || req.headers['x-access-token'];
        if (!header) {
            return res.status(401).json({ message: "No token provided" });
        }

        // header can be 'Bearer <token>' or just the token
        const token = typeof header === 'string' && header.startsWith('Bearer ') ? header.split(' ')[1] : header;
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // attach useful info
        req.userId = decoded.id || decoded._id || decoded.userId;
        req.user = decoded;
        next();
    } catch (err) {
        console.error('verifyToken error:', err.message || err);
        return res.status(401).json({ message: 'invalidToken', error: err.message });
    }
};