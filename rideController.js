const Ride = require("../models/Ride");
const { findNearbyDrivers } = require("../services/driverService");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const Ride = require("../models/Ride");


// =====================
// 🚗 REQUEST RIDE
// =====================
const { findNearbyDrivers } = require("../utils/locationUtils");

const requestRide = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination, pickupLat, pickupLng, dropoffLat, dropoffLng } = req.body;

    // Create ride
    const ride = new Ride({
      user: req.user.id,
      pickup,
      destination,
      pickupLocation: pickupLat && pickupLng ? { lat: pickupLat, lng: pickupLng } : undefined,
      dropoffLocation: dropoffLat && dropoffLng ? { lat: dropoffLat, lng: dropoffLng } : undefined,
      status: "requested"
    });

    await ride.save();

    const io = req.app.get("io");

    // =============================
    // 🚗 REAL-TIME DRIVER MATCHING
    // =============================
    if (pickupLat && pickupLng) {
      const nearbyDrivers = await findNearbyDrivers(
        pickupLat,
        pickupLng,
        5 // 5km radius
      );

      nearbyDrivers.forEach((driver) => {
        io.to(driver.driverId.toString()).emit("newRide", ride);
      });
    } else {
      // fallback: broadcast to all drivers
      if (io) {
        io.emit("newRide", ride);
      }
    }

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

    if (ride.status !== "requested") {
      return res.status(400).json({ message: "Ride already taken" });
    }

    ride.status = "accepted";
    ride.driver = req.user.id;

    await ride.save();

    const io = req.app.get("io");

    // 🔥 notify ONLY the rider
    if (io) {
      io.to(ride.user.toString()).emit("rideAccepted", ride);
    }

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

    if (!mongoose.Types.ObjectId.isValid(rideId)) {
      return res.status(400).json({ message: "Invalid ride ID" });
    }

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.status !== "accepted") {
      return res.status(400).json({ message: "Ride must be accepted first" });
    }

    ride.status = "in_progress";

    await ride.save();

    const io = req.app.get("io");

    // 🔥 notify ONLY the rider
    if (io) {
      io.to(ride.user.toString()).emit("rideStarted", ride);
    }

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

    if (!mongoose.Types.ObjectId.isValid(rideId)) {
      return res.status(400).json({ message: "Invalid ride ID" });
    }

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.status !== "in_progress") {
      return res.status(400).json({ message: "Ride must be in progress first" });
    }

    ride.status = "completed";

    await ride.save();

    const io = req.app.get("io");

    // 🔥 notify ONLY the rider
    if (io) {
      io.to(ride.user.toString()).emit("rideCompleted", ride);
    }

    res.json(ride);

  } catch (err) {
    console.error("Complete Ride Error:", err);
    res.status(500).json({ error: err.message });
  }
};


// =====================
// 📄 GET RIDES
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
// 📄 GET AVAILABLE RIDES
// =====================
const getAvailableRides = async (req, res) => {
  try {
    const rides = await Ride.find({ status: "requested" });
    res.json(rides);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// =====================
// EXPORTS
// =====================
module.exports = {
  requestRide,
  getAvailableRides,
  acceptRide,
  pickUpRide,
  completeRide,
  getRides
};

const { findNearbyDrivers } = require("../services/driverService");

const nearbyDrivers = await findNearbyDrivers(
  pickupLat,
  pickupLng,
  5
);

const io = req.app.get("io");

nearbyDrivers.forEach((driver) => {
  io.to(driver.driverId.toString()).emit("newRide", ride);
});

module.exports = {
  createRide
};
