import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./db.js";
import authRouter from "./routes/auth.js";
import complaintsRouter from "./routes/complaints.js";

dotenv.config();

const app = express();

// ========================
// 🔹 Middleware
// ========================
app.use(
  cors({ 
    origin: [
      process.env.CORS_ORIGIN || "http://localhost:5173",
      "http://localhost:5174"
    ], 
    credentials: true 
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Static serving of uploaded files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ========================
// 🔹 Health Check
// ========================
app.get("/health", (_req, res) => {
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    database: "MongoDB"
  });
});

// ========================
// 🔹 Test Endpoint
// ========================
app.get("/api/test", async (_req, res) => {
  try {
    const { mongoose } = await import('./db.js')
    const User = (await import('./models/User.js')).default
    
    // Test database connection
    const userCount = await User.countDocuments()
    
    res.json({
      success: true,
      message: "MongoDB connection successful",
      userCount: userCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Test endpoint error:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
});

// ========================
// 🔹 API Routes
// ========================
app.use("/api/auth", authRouter);
app.use("/api/complaints", complaintsRouter);

// ========================
// 🔹 Error Handling
// ========================
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation Error', 
      details: err.message 
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({ 
      error: 'Invalid ID format' 
    });
  }
  
  if (err.code === 11000) {
    return res.status(409).json({ 
      error: 'Duplicate entry', 
      field: Object.keys(err.keyPattern)[0] 
    });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// ========================
// 🔹 404 Handler
// ========================
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// ========================
// 🔹 Start Server
// ========================
const port = process.env.PORT || 4000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start the server
    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
      console.log(`📊 Database: MongoDB`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
