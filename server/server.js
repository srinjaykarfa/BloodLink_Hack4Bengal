const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const { createServer } = require("http")
const { Server } = require("socket.io")

// Load environment variables
dotenv.config()

const app = express()
const server = createServer(app)

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://blood-link-hack4-bengal.vercel.app",
    process.env.FRONTEND_URL?.replace(/\/$/, ""), // Remove trailing slash if exists
  ].filter(Boolean),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
}

// Socket.IO setup
const io = new Server(server, {
  cors: corsOptions,
  transports: ["websocket", "polling"],
})

app.use(cors(corsOptions))

// Middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Make io available to routes
app.set("io", io)

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "🩸 E-Blood Link API Server",
    status: "Running",
    version: "1.0.0",
    websocket: "Socket.IO Enabled",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth/*",
      donors: "/api/donors/*",
      requests: "/api/requests/*",
      inventory: "/api/inventory/*",
      users: "/api/users/*",
      chat: "/api/chat/*",
    },
  })
})

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "E-Blood Link API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    websocket: "Socket.IO Active",
    cors: {
      allowedOrigins: corsOptions.origin,
      requestOrigin: req.headers.origin || null,
    },
  })
})

// Socket.IO connection handling
const connectedUsers = new Map() // userId -> socketId mapping

io.on("connection", (socket) => {
  console.log(`🔌 User connected: ${socket.id}`)

  // User joins with their ID
  socket.on("join", (userId) => {
    console.log(`👤 User ${userId} joined with socket ${socket.id}`)
    connectedUsers.set(userId, socket.id)
    socket.userId = userId
    socket.join(`user_${userId}`)
  })

  // Join chat room
  socket.on("join_chat", (chatId) => {
    console.log(`💬 User ${socket.userId} joined chat ${chatId}`)
    socket.join(`chat_${chatId}`)
  })

  // Leave chat room
  socket.on("leave_chat", (chatId) => {
    console.log(`👋 User ${socket.userId} left chat ${chatId}`)
    socket.leave(`chat_${chatId}`)
  })

  // Handle typing indicators
  socket.on("typing", ({ chatId, isTyping }) => {
    socket.to(`chat_${chatId}`).emit("user_typing", {
      userId: socket.userId,
      isTyping,
    })
  })

  // Handle message seen status
  socket.on("messages_seen", ({ chatId, messageIds }) => {
    socket.to(`chat_${chatId}`).emit("messages_seen", {
      userId: socket.userId,
      messageIds,
    })
  })

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`🔌 User disconnected: ${socket.id}`)
    if (socket.userId) {
      connectedUsers.delete(socket.userId)
    }
  })
})

// Make connectedUsers available globally
global.connectedUsers = connectedUsers
global.io = io

// Routes
app.use("/api/auth", require("./routes/auth"))
app.use("/api/donors", require("./routes/donors"))
app.use("/api/requests", require("./routes/requests"))
app.use("/api/inventory", require("./routes/inventory"))
app.use("/api/users", require("./routes/users"))
app.use("/api/chat", require("./routes/chat"))

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err)
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  })
})

// MongoDB connection
const connectDB = async () => {
  try {
    console.log("🔄 Connecting to MongoDB Atlas...")

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)
    console.log(`📊 Database: ${conn.connection.name}`)
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message)
    process.exit(1)
  }
}

// Start server
const PORT = process.env.PORT || 5000

const startServer = async () => {
  await connectDB()

  server.listen(PORT, () => {
    console.log("\n" + "=".repeat(50))
    console.log("🚀 Server running on port", PORT)
    console.log("📱 API URL:", `http://localhost:${PORT}/api`)
    console.log("🏥 Health Check:", `http://localhost:${PORT}/api/health`)
    console.log("🔌 Socket.IO:", `http://localhost:${PORT}`)
    console.log("🌍 Environment:", process.env.NODE_ENV)
    console.log("🔗 CORS Origins:", corsOptions.origin)
    console.log("=".repeat(50) + "\n")
  })
}

startServer()

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error("❌ Unhandled Promise Rejection:", err.message)
  process.exit(1)
})
