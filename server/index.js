const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const allowedUsers = ["8660600503", "8217358015"];
let messages = []; // This stores all messages in memory

const app = express();
app.use(cors());
app.use(express.json());

app.post("/login", (req, res) => {
  const { phone } = req.body;
  if (allowedUsers.includes(phone)) {
    res.status(200).send({ success: true });
  } else {
    res.status(401).send({ success: false, message: "Unauthorized" });
  }
});

app.get("/messages", (req, res) => {
  res.send(messages);
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("send_message", (data) => {
    messages.push(data);
    io.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
