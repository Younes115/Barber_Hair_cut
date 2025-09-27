const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // تصحيح الأخطاء
    if (!token) {
        return res.status(401).send('No token provided.');
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // تصحيح الاسم
        if (decoded.role !== "admin") {
            return res.status(403).send("Access denied. Admin role required");
        }
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).send('Invalid token.');
    }
}