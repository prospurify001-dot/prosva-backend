require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const winston = require("winston");
const rateLimit = require("express-rate-limit");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

/* =====================
   🔐 MIDDLEWARE
===================== */

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, try again later."
});

app.use(limiter);

// Core middleware
app.use(cors());
app.use(express.json());

// HTTP request logging
app.use(morgan("dev"));

/* =====================
   🪵 LOGGER (WINSTON)
===================== */

const logger = winston.createLogger({
  level: "info",
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs.log" })
  ]
});

logger.info("Server initializing...");

/* =====================
   🩺 HEALTH CHECK
===================== */

app.get("/", (req, res) => {
  res.status(200).send("Prosva API running 🚀");
});

/* =====================
   🚀 ROUTES
===================== */

app.use("/api/auth", require("./routes/authRoutes"));
logger.info("Auth routes loaded");

app.use("/api/rides", require("./routes/rideRoutes"));
logger.info("Ride routes loaded");

app.use("/api/driver", require("./routes/driverRoutes"));
logger.info("Driver routes loaded")

/* =====================
   ❌ ERROR HANDLER
===================== */

app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    message: "Internal server error"
  });
});

/* =====================
   🗄️ DATABASE
===================== */

if (!process.env.MONGO_URI) {
  logger.error("MONGO_URI is missing in environment variables");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    logger.info("MongoDB connected successfully");
  })
  .catch((err) => {
    logger.error("MongoDB connection error:", err.message);
    process.exit(1);
  });


/* =====================
   🌐 SERVER + SOCKET.IO
===================== */

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// Make io accessible in controllers
app.set("io", io);

io.on("connection", (socket) => {
  logger.info(`User connected: ${socket.id}`);

  socket.on("join", (userId) => {
    if (userId) {
      socket.join(userId);
      logger.info(`User joined room: ${userId}`);
    }
  });

  socket.on("joinDrivers", () => {
    socket.join("drivers");
    logger.info("Driver joined drivers room");
  });

  // 🚗 Live driver location updates
  socket.on("driverLocation", async ({ driverId, lat, lng }) => {
    try {
      await DriverLocation.findOneAndUpdate(
        { driverId },
        { lat, lng, updatedAt: new Date() },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error("Driver location update error:", err.message);
    }
  });

  socket.on("disconnect", () => {
    logger.info(`User disconnected: ${socket.id}`);
  });


  // 👤 Join user-specific room
  socket.on("join", (userId) => {
    if (userId) {
      socket.join(userId);
      logger.info(`User joined room: ${userId}`);
    }
  });

  // 🚖 Join drivers room
  socket.on("joinDrivers", () => {
    socket.join("drivers");
    logger.info(`Driver joined drivers room`);
  });

  socket.on("disconnect", () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});

// Make io accessible globally in controllers
app.set("io", io);

io.on("connection", (socket) => {
  logger.info(`User connected: ${socket.id}`);

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

const DriverLocation = require("./models/DriverLocation");

io.on("connection", (socket) => {
  logger.info(`User connected: ${socket.id}`);

  socket.on("join", (userId) => {
    if (userId) socket.join(userId);
  });

  socket.on("joinDrivers", () => {
    socket.join("drivers");
  });

  // 🚗 Driver sends live location
  socket.on("driverLocation", async ({ driverId, lat, lng }) => {
    try {
      await DriverLocation.findOneAndUpdate(
        { driverId },
        { lat, lng, updatedAt: new Date() },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error("Driver location update error:", err.message);
    }
  });

  socket.on("disconnect", () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});