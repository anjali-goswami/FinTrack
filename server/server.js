
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env") });

// Initialize Express app
const app = express();

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://fintrack-frontend-8zpj.onrender.com"
];

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header (e.g. health checks)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json({ limit: "10kb" }));

// Validate API request content type
app.use((req, res, next) => {
  if (
    req.path.startsWith("/api") &&
    req.method !== "GET" &&
    req.method !== "HEAD" &&
    !req.is("application/json")
  ) {
    return res.status(415).json({
      message: "Content-Type must be application/json."
    });
  }

  return next();
});

// Test route
app.get("/", (req, res) => {
  res.status(200).send("Personal Finance Tracker API is running!");
});

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is working properly"
  });
});

// API routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/budgets", require("./routes/budgetRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found."
  });
});

// Global error handler
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.message === "Not allowed by CORS") {
    return res.status(403).json({
      message: "This origin is not allowed."
    });
  }

  if (error.code === 11000) {
    const message = error.keyPattern?.email
      ? "An account with this email already exists."
      : "A budget with this category and duration already exists.";

    return res.status(409).json({ message });
  }

  if (
    error.name === "ValidationError" ||
    error.name === "CastError"
  ) {
    return res.status(400).json({
      message: "Some submitted data is invalid."
    });
  }

  console.error(error);

  return res.status(500).json({
    message: "Server error. Please try again."
  });
});

// Start server after connecting to MongoDB
const startServer = async () => {
  try {
    if (
      !process.env.JWT_SECRET ||
      process.env.JWT_SECRET.length < 32
    ) {
      throw new Error(
        "JWT_SECRET must contain at least 32 characters in server/.env"
      );
    }

    await connectDB();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
