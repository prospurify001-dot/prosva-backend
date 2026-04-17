const Ride = require("../models/Ride");

// 🚗 Request Ride
const requestRide = async (req, res) => {
  try {
    const {
      pickupLat,
      pickupLng,
      dropoffLat,
      dropoffLng
    } = req.body;

    const ride = new Ride({
      riderId: req.user?.id, // requires auth middleware
      pickupLat,
      pickupLng,
      dropoffLat,
      dropoffLng,
      status: "pending"
    });

    await ride.save();

    res.status(201).json(ride);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🚖 Accept Ride
const acceptRide = async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.status !== "pending") {
      return res.status(400).json({ message: "Ride already taken" });
    }

    ride.status = "accepted";
    ride.driverId = req.user?.id;

    await ride.save();

    res.json(ride);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📍 Pickup Ride
const pickUpRide = async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    ride.status = "picked_up";

    await ride.save();

    res.json(ride);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Complete Ride
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