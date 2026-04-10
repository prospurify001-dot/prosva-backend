const mongoose = require("mongoose");

const driverLocationSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Driver",
    required: true
  },
  lat: Number,
  lng: Number
}, { timestamps: true });

module.exports = mongoose.model("DriverLocation", driverLocationSchema);