require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

const MAX_USERS = 5;
let usersInRoom = 0;
const USERS = process.env.USERS.split(",").map((user) => {
  const [username, password] = user.split(":");
  return { username, password };
});

io.on("connection", (socket) => {
  socket.on("login", ({ username, password }, callback) => {
    const validUser = USERS.find(
      (user) => user.username === username && user.password === password
    );

    if (!validUser) {
      return callback({
        success: false,
        message: "Invalid username or password",
      });
    }

    socket.username = username;
    callback({ success: true });
  });

  socket.on("join-room", () => {
    const roomId = "global-room";

    if (usersInRoom >= MAX_USERS) {
      socket.emit("room-full", { message: "Room is full" });
      return;
    }

    socket.join(roomId);
    usersInRoom++;
    console.log(
      `User ${socket.username} joined room: ${roomId} (Users in room: ${usersInRoom})`
    );

    socket.to(roomId).emit("user-connected", socket.id);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      socket.to(roomId).emit("user-disconnected", socket.id);
      usersInRoom--;
    });
  });

  socket.on("offer", (offer) => {
    const roomId = "global-room";
    socket.to(roomId).emit("offer", offer);
  });

  socket.on("answer", (answer) => {
    const roomId = "global-room";
    socket.to(roomId).emit("answer", answer);
  });
});

server.listen(3003, () => {
  console.log("Server running on http://localhost:3000");
});
