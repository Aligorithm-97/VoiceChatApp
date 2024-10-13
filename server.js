const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);

    socket.to(roomId).emit("user-connected", socket.id);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      socket.to(roomId).emit("user-disconnected", socket.id);
    });
  });

  socket.on("offer", (offer, roomId) => {
    socket.to(roomId).emit("offer", offer);
  });

  socket.on("answer", (answer, roomId) => {
    socket.to(roomId).emit("answer", answer);
  });

  const allowedUsers = ["user1", "user2"];

  socket.on("join-room", (roomId, user) => {
    if (allowedUsers.includes(user)) {
      socket.join(roomId);
    } else {
      socket.disconnect();
    }
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
