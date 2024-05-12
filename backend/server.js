const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const DbConnect = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const path = require("path");

const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const app = express();
dotenv.config();
DbConnect();

app.use(express.json());
app.use(cors());

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

//--- deployment

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname1, "frontend", "dist", "index.html"));
  });
} else {
  app.get("/", (req, res, next) => {
    res.send("app run successfully");
  });
}
//------

app.use(errorHandler);
app.use(notFound);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log(`app running at ${PORT}`));

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("connected to socket.io");

  socket.on("setup", (user) => {
    socket.join(user._id); // Join the room of that particular userId
    socket.emit("connected");
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("join room", (room) => {
    socket.join(room);
    console.log("joined room with userId: " + room);
  });

  socket.on("new message", (newRecievedMessage) => {
    let chat = newRecievedMessage.chat;
    if (!chat) return;

    chat.users.forEach((user) => {
      if (newRecievedMessage.sender._id === user._id) return;
      socket.in(user._id).emit("received message", newRecievedMessage);
    });
  });
});
