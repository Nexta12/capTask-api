// Load environment variables early
import { config } from "dotenv";
config({ path: "./config/.env" });

// Import core dependencies
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import session from "express-session";
import morgan from "morgan";
import passport from "passport";

// Import project dependencies
import logger from "./logs/loggerHandler.js";
import routes from "./src/routes/index.js";
import connectDB from "./src/database/connection.js";
import MongoStore from "connect-mongo";
import errorHandler from "./src/utils/errorHandler.js";
import { initialize } from "./src/services/passport.js";
import InitializeSuperAdmin from "./src/utils/InitializeSuperAdmin.js";




// Initialize Express app
const app = express();
const port = process.env.PORT || 6000;


// Initialize Passport Middleware
initialize(passport);

// Connect to the database
connectDB();

// Initialize Super Admin
InitializeSuperAdmin()

// Middleware: Security, Performance, and Parsing
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(cors({ // Enable CORS for frontend communication
  origin: process.env.FRONTEND_BASE_URL,
  methods: ["GET", "PUT", "POST", "PATCH", "DELETE"],
  credentials: true
}));
app.use(helmet()); // Set security headers
app.use(morgan("tiny")); // Log HTTP requests
app.use(cookieParser()); // Parse cookies

// Enable session management with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: false,
  rolling: true, // Refresh session expiration on activity
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 10800, // Session expiration: 3 hours
    autoRemove: "native"
  }),
  cookie: {
    maxAge: 10800000 // 3 hours
  }
}));

// Load passport middlewares
app.use(passport.initialize());
app.use(passport.session());

// Enable Gzip compression for improved performance
app.use(compression({ level: 6 }));

// Set global variables
global.logger = logger;

// Register API routes
app.use("/api", routes);


// Handle 404 errors for undefined routes
app.use((req, res) => {
  res.status(404).json({
    message: `This route does not exist: [${req.method}] ${req.url}`
  });
});

// Global error handler (Placed after Routes)
app.use(errorHandler);

// Start the server
const server = app.listen(port, () => {
  console.log(` Server running on http://localhost:${port}`);
});

// Graceful shutdown handling
const gracefulShutdown = () => {
  logger.info(" Shutting down gracefully...");

  server.close(() => {
    logger.info(" HTTP server closed.");
  });
};

// Capture termination signals
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
