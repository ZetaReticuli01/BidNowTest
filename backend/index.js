require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const auctionRoutes = require("./routes/auctionRoutes");
const bidRoutes = require("./routes/bidRoutes");
const chatRoutes = require("./routes/chatRoutes");

const chatSocket = require("./sockets/chatSocket.js");
const bidSocket = require("./sockets/bidSocket.js");

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("Uploads")); // Case-sensitive fix

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

global.io = io;

io.on("connection", (socket) => {
  console.log(`WebSocket Connected: ${socket.id}`);

  bidSocket(io, socket);
  chatSocket(io, socket);

  socket.on("disconnect", () => {
    console.log(`WebSocket Disconnected: ${socket.id}`);
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/auction", auctionRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/chat", chatRoutes);

connectDB();

const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});