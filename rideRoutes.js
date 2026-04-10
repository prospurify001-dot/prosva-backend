const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  requestRide,
  getAvailableRides,
  acceptRide,
  pickUpRide,
  completeRide
} = require("../controllers/rideController");

// Rider requests ride
router.post("/request", requestRide);

// Driver gets available rides
router.get("/", authMiddleware, getAvailableRides);

// Driver accepts ride
router.put("/:id/accept", authMiddleware, acceptRide);

// Driver picks up rider
router.put("/:id/pickup", authMiddleware, pickUpRide);

// Driver completes ride
router.put("/:id/complete", authMiddleware, completeRide);

module.exports = router;