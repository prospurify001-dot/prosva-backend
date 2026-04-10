const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Ride = require("../models/Ride");

// Request Ride
const requestRide = async (req, res) => {
  try {
    const ride = new Ride({
      user: req.user.id,
      pickup: "Sample Pickup",
      destination: "Sample Destination",
      status: "requested" // ✅ FIXED
    });

    await ride.save();

    res.status(201).json(ride);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const acceptRide = async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    const Ride = require("../models/Ride");

const acceptRide = async (req, res) => {
  const { rideId, driverId } = req.body;

  const ride = await Ride.findById(rideId);

  if (!ride) {
    return res.status(404).json({ message: "Ride not found" });
  }

  if (ride.status !== "pending") {
    return res.status(400).json({ message: "Ride already accepted" });
  }

  ride.driverId = driverId;
  ride.status = "accepted";

  await ride.save();

  const io = req.app.get("io");

  // notify rider
  io.to(ride.riderId.toString()).emit("rideAccepted", ride);

  res.json(ride);
};

const updateRideStatus = async (req, res) => {
  const { rideId, status } = req.body;

  const ride = await Ride.findById(rideId);

  if (!ride) {
    return res.status(404).json({ message: "Ride not found" });
  }

  ride.status = status;
  await ride.save();

  const io = req.app.get("io");

  // notify rider
  io.to(ride.riderId.toString()).emit("rideStatusUpdated", ride);

  res.json(ride);
};
    // Prevent double acceptance
    if (ride.status !== "requested") {
      return res.status(400).json({ message: "Ride already taken" });
    }

    ride.status = "accepted";
    ride.driver = req.user.id;

    await ride.save();

    res.json(ride);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Pickup Ride
const pickUpRide = async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    ride.status = "picked_up"; // ✅ FIXED

    await ride.save();

    res.json(ride);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Complete Ride
const completeRide = async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    ride.status = "completed";

    await ride.save();

    res.json(ride);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  requestRide,
  acceptRide,
  pickUpRide,
  completeRide
};