require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const winston = require("winston");
const rateLimit = require("express-rate-limit");

const app = express();


// =====================
// 🔐 SECURITY + MIDDLEWARE
// =====================

// Rate Limiting (protect your API)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 100,
  message: "Too many requests, try again later."
});
app.use(limiter);

// CORS + JSON
app.use(cors());
app.use(express.json());

// Logging (Morgan)
app.use(morgan("dev"));

// Winston Logger
const logger = winston.createLogger({
  level: "info",
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs.log" })
  ]
});

logger.info("Server initialized");


// =====================
// 🩺 HEALTH CHECK
// =====================
app.get("/", (req, res) => {
  res.send("Prosva API running 🚀");
});


// =====================
// 🚀 ROUTES
// =====================
app.use("/api/auth", require("./routes/authRoutes"));
console.log("✅ authRoutes loaded");

app.use("/api/rides", require("./routes/rideRoutes"));
console.log("✅ rideRoutes loaded");


// =====================
// ❌ GLOBAL ERROR HANDLER
// =====================
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});


// =====================
// 🗄️ DATABASE CONNECTION
// =====================
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is not defined in .env");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    logger.info("MongoDB Connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });


// =====================
// 🌐 SERVER START
// =====================
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// make io accessible in controllers
app.set("io", io);

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  logger.info(`Server running on port ${PORT}`);
});

console.log("MONGO_URI:", process.env.MONGO_URI);