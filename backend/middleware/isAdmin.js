// Role-check middleware — must run AFTER verifyToken so req.user is set.
module.exports = (req, res, next) => {
    // If verifyToken didn't run or the token lacked user info
    if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admin role required" });
    }

    next();
};