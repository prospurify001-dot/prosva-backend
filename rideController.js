const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const Ride = require("../models/Ride");


// =====================
// 🚗 REQUEST RIDE
// =====================
const requestRide = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination } = req.body;

    const ride = new Ride({
      user: req.user.id,
      pickup,
      destination,
      status: "requested"
    });

    await ride.save();

    // 🔴 Real-time event
    const io = req.app.get("io");
    if (io) io.emit("newRide", ride);

    res.status(201).json(ride);

  } catch (err) {
    console.error("Request Ride Error:", err);
    res.status(500).json({ error: err.message });
  }
};


// =====================
// ✅ ACCEPT RIDE
// =====================
const acceptRide = async (req, res) => {
  try {
    const { rideId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(rideId)) {
      return res.status(400).json({ message: "Invalid ride ID" });
    }

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    // Prevent double acceptance
    if (ride.status !== "requested") {
      return res.status(400).json({ message: "Ride already taken" });
    }

    ride.status = "accepted";
    ride.driver = req.user.id;

    await ride.save();

    // 🔴 Real-time event
    const io = req.app.get("io");
    if (io) io.emit("rideAccepted", ride);

    res.json(ride);

  } catch (err) {
    console.error("Accept Ride Error:", err);
    res.status(500).json({ error: err.message });
  }
};


// =====================
// 🚘 PICKUP RIDE
// =====================
const pickUpRide = async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    // Validate flow
    if (ride.status !== "accepted") {
      return res.status(400).json({ message: "Ride must be accepted first" });
    }

    ride.status = "in_progress";

    await ride.save();

    // 🔴 Real-time event
    const io = req.app.get("io");
    if (io) io.emit("rideStarted", ride);

    res.json(ride);

  } catch (err) {
    console.error("Pickup Ride Error:", err);
    res.status(500).json({ error: err.message });
  }
};


// =====================
// 🏁 COMPLETE RIDE
// =====================
const completeRide = async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    // Validate flow
    if (ride.status !== "in_progress") {
      return res.status(400).json({ message: "Ride must be in progress first" });
    }

    ride.status = "completed";

    await ride.save();

    // 🔴 Real-time event
    const io = req.app.get("io");
    if (io) io.emit("rideCompleted", ride);

    res.json(ride);

  } catch (err) {
    console.error("Complete Ride Error:", err);
    res.status(500).json({ error: err.message });
  }
};


// =====================
// 📄 GET RIDES (PAGINATION)
// =====================
const getRides = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const rides = await Ride.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json(rides);

  } catch (err) {
    console.error("Get Rides Error:", err);
    res.status(500).json({ error: err.message });
  }
};


// =====================
// EXPORTS
// =====================
module.exports = {
  requestRide,
  acceptRide,
  pickUpRide,
  completeRide,
  getRides
};