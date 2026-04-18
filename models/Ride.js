const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null
    },
    pickupLat: Number,
    pickupLng: Number,
    dropoffLat: Number,
    dropoffLng: Number,

    status: {
      type: String,
      enum: ["pending", "accepted", "arrived", "picked_up", "completed"],
      default: "pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ride", rideSchema);
