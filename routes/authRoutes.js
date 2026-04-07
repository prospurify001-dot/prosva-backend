console.log("✅ authRoutes loaded");

const express = require("express");
const router = express.Router();

const { register, login } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Auth route is working" });
});

// Protected route
router.get("/profile", (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user
  });
});

module.exports = router;

