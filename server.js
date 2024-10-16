require("dotenv").config();
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

  socket.on("join-room", () => {
    socket.join("global-room");
    socket.to("global-room").emit("user-connected", socket.id);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
      socket.to("global-room").emit("user-disconnected", socket.id);
    });

    socket.on("offer", (offer) => {
      socket.to("global-room").emit("offer", offer, socket.id);
    });

    socket.on("answer", (answer) => {
      socket.to("global-room").emit("answer", answer, socket.id);
    });

    socket.on("candidate", (candidate) => {
      socket.to("global-room").emit("candidate", candidate, socket.id);
    });
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
