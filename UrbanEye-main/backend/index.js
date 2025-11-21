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
      "http://localhost:5174",
      "https://urbaneye-frontend-latest.onrender.com",
      /\.onrender\.com$/,  // Allow all Render domains
      /\.web\.app$/,  // Allow Firebase Hosting
      /\.firebaseapp\.com$/  // Allow Firebase Hosting
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
// 🔹 Admin Routes (Legacy Support)
// ========================
app.post("/api/admin/signup", async (req, res) => {
  try {
    const { full_name, email, password, division } = req.body;

    if (!email || !email.endsWith("@bbmp.gov.in")) {
      return res.json({ success: false, error: "Only @bbmp.gov.in emails are allowed" });
    }
    if (!password || !division || !full_name) {
      return res.json({ success: false, error: "All fields are required" });
    }

    // Import User model
    const User = (await import('./models/User.js')).default;
    const jwt = (await import('jsonwebtoken')).default;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, error: "Admin already registered" });
    }

    // Create new admin user
    const user = new User({
      fullName: full_name,
      email,
      password,
      role: 'admin',
      division
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        sub: user._id, 
        role: user.role, 
        division: user.division 
      }, 
      process.env.JWT_SECRET || 'dev_secret_change_me', 
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: "Admin registered successfully",
      admin: user.toJSON(),
      token
    });
  } catch (error) {
    console.error("Admin signup error:", error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.json({ success: false, error: errors.join(', ') });
    }
    
    if (error.code === 11000) {
      return res.json({ success: false, error: "Email already exists" });
    }
    
    res.json({ success: false, error: "Error registering admin" });
  }
});

app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password, division } = req.body;

    if (!email || !email.endsWith("@bbmp.gov.in")) {
      return res.json({ success: false, error: "Only @bbmp.gov.in emails are allowed" });
    }

    // Import models
    const User = (await import('./models/User.js')).default;
    const AdminLogin = (await import('./models/AdminLogin.js')).default;
    const jwt = (await import('jsonwebtoken')).default;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, error: "Admin not found or unauthorized" });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.json({ success: false, error: "Admin not found or unauthorized" });
    }

    // Check division if provided
    if (division && user.division !== division) {
      return res.json({ success: false, error: "Division mismatch" });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.json({ success: false, error: "Invalid password" });
    }

    // Update login info
    await user.updateLoginInfo();

    // Log admin login
    const adminLogin = new AdminLogin({
      email: user.email,
      division: user.division,
      adminId: user._id,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });
    await adminLogin.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        sub: user._id, 
        role: user.role, 
        division: user.division 
      }, 
      process.env.JWT_SECRET || 'dev_secret_change_me', 
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      admin: user.toJSON()
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.json({ success: false, error: "Error during login" });
  }
});

// ========================
// 🔹 Serve React Frontend (⚡ Only if frontend build exists)
// ========================
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "client", "build");
  const fs = await import('fs');
  
  // Only serve frontend if build directory exists
  if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));

    app.get("*", (req, res) => {
      res.sendFile(path.join(frontendPath, "index.html"));
    });
  }
}

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
