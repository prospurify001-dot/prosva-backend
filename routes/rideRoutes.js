const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  requestRide,
  acceptRide,
  pickUpRide,
  completeRide
} = require("../controllers/rideController");

router.post("/request", requestRide);
router.put("/accept/:rideId", authMiddleware, acceptRide);
router.put("/pickup/:rideId", authMiddleware, pickUpRide);
router.put("/complete/:rideId", authMiddleware, completeRide);

router.get("/", (req, res) => {
  res.json({ message: "Ride routes working ✅" });
});

module.exports = router;