require("dotenv").config();

const http = require("http");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const connectDB = require("./config/db");
const initSocket = require("./socket");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { message: "Too many attempts. Please try again later." },
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);

connectDB();

app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Socket.io needs the raw HTTP server (app.listen() alone never starts it)
const server = http.createServer(app);
initSocket(server);

server.listen(5000, () => {
  console.log("Server is running on port 5000");
});