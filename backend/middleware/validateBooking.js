const { body, validationResult } = require("express-validator");

// Validation rules for POST /api/booking
const bookingRules = [
    body("name")
        .trim()
        .notEmpty().withMessage("Name is required.")
        .isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters."),

    body("email")
        .trim()
        .notEmpty().withMessage("Email is required.")
        .isEmail().withMessage("Please provide a valid email address."),

    body("date")
        .notEmpty().withMessage("Date is required.")
        .isISO8601().withMessage("Date must be a valid date.")
        .custom((value) => {
            const bookingDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (bookingDate < today) {
                throw new Error("Booking date cannot be in the past.");
            }
            return true;
        }),

    body("time")
        .trim()
        .notEmpty().withMessage("Time is required."),

    body("phone")
        .trim()
        .notEmpty().withMessage("Phone number is required.")
        .matches(/^\d{8,15}$/).withMessage("Phone number must be between 8 and 15 digits."),

    body("services")
        .isArray({ min: 1 }).withMessage("At least one service must be selected.")
];

// Middleware that runs the rules and returns errors if any
const validateBooking = [
    ...bookingRules,
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Validation failed",
                errors: errors.array().map((e) => ({ field: e.path, message: e.msg }))
            });
        }
        next();
    }
];

module.exports = { validateBooking };
