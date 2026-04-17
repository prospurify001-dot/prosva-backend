require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const winston = require("winston");
const rateLimit = require("express-rate-limit");
const http = require("http");
const { Server } = require("socket.io");

const DriverLocation = require("./models/DriverLocation");

const app = express();

/* =====================
   🔐 MIDDLEWARE
===================== */

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

/* =====================
   🪵 LOGGER
===================== */

const logger = winston.createLogger({
  level: "info",
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs.log" })
  ]
});

logger.info("Server starting...");

/* =====================
   🩺 HEALTH CHECK
===================== */

app.get("/", (req, res) => {
  res.json({ message: "Prosva API running 🚀" });
});

/* =====================
   🚀 ROUTES
===================== */

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/rides", require("./routes/rideRoutes"));
app.use("/api/driver", require("./routes/driverRoutes"));

logger.info("Routes loaded");

/* =====================
   🗄️ DATABASE
===================== */

mongoose.connect(process.env.MONGO_URI)
  .then(() => logger.info("MongoDB connected"))
  .catch(err => {
    logger.error(err.message);
    process.exit(1);
  });

/* =====================
   🌐 SERVER + SOCKET.IO
===================== */

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

app.set("io", io);

io.on("connection", (socket) => {
  logger.info(`User connected: ${socket.id}`);

  socket.on("join", (userId) => {
    if (userId) socket.join(userId);
  });

  socket.on("joinDrivers", () => {
    socket.join("drivers");
  });

  socket.on("driverLocation", async ({ driverId, lat, lng }) => {
    try {
      await DriverLocation.findOneAndUpdate(
        { driverId },
        { lat, lng, updatedAt: new Date() },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error(err.message);
    }
  });

  socket.on("disconnect", () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

/* =====================
   🚀 START SERVER
===================== */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});