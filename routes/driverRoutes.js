const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  goOnline,
  goOffline,
  updateLocation
} = require("../controllers/driverController");

router.put("/online", authMiddleware, goOnline);
router.put("/offline", authMiddleware, goOffline);
router.put("/location", authMiddleware, updateLocation);

module.exports = router;

