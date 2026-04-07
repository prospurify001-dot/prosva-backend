const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  pickup: String,
  destination: String,
  status: {
    type: String,
    enum: ["requested", "accepted", "picked_up", "completed"],
    default: "requested"
  }
}, { timestamps: true });

module.exports = mongoose.model("Ride", rideSchema);