const { io } = require("socket.io-client");

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("✅ Connected to server:", socket.id);
});

// Listen for events
socket.on("newRide", (data) => {
  console.log("🚗 New Ride:", data);
});

socket.on("rideAccepted", (data) => {
  console.log("✅ Ride Accepted:", data);
});

socket.on("rideStarted", (data) => {
  console.log("🚘 Ride Started:", data);
});

socket.on("rideCompleted", (data) => {
  console.log("🏁 Ride Completed:", data);
});