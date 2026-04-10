const Driver = require("../models/DriverLocation");
const DriverLocation = require("../models/DriverLocation");

// =====================
// 🚗 GO ONLINE
// =====================
const goOnline = async (req, res) => {
  try {
    const driver = await Driver.findOneAndUpdate(
      { user: req.user.id },
      { isOnline: true },
      { new: true, upsert: true }
    );

    res.json(driver);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// 🚫 GO OFFLINE
// =====================
const goOffline = async (req, res) => {
  try {
    const driver = await Driver.findOneAndUpdate(
      { user: req.user.id },
      { isOnline: false },
      { new: true }
    );

    res.json(driver);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// 📍 UPDATE LOCATION
// =====================
const updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    // find driver
    const driver = await Driver.findOne({ user: req.user.id });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    const location = await DriverLocation.findOneAndUpdate(
      { driverId: driver._id },
      { lat, lng, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    const io = req.app.get("io");

    if (io) {
      io.emit("driverLocationUpdate", {
        driverId: driver._id,
        lat,
        lng
      });
    }

    res.json(location);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =====================
// EXPORTS
// =====================
module.exports = {
  goOnline,
  goOffline,
  updateLocation
};