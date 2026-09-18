// Builds the Express application and installs security, routes and documentation.

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");

const env = require("./config/env");
const openapi = require("./docs/openapi");
const authRoutes = require("./routes/authRoutes");
const recordRoutes = require("./routes/recordRoutes");
const adminRecordRoutes = require("./routes/adminRecordRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const AppError = require("./utils/AppError");

const app = express();
const allowedOrigins = env.CORS_ORIGIN.split(",").map((origin) => origin.trim());

app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new AppError("Origin is not allowed by CORS", 403));
    },
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

if (env.NODE_ENV !== "test") app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(
  "/api/v1",
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    limit: env.RATE_LIMIT_MAX,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { success: false, message: "Too many requests. Please try again later.", data: null },
  })
);

app.get("/", (_req, res) =>
  res.status(200).json({
    success: true,
    message: "Search API is running",
    data: { documentation: "/api/v1/docs", health: "/health" },
  })
);

app.get("/health", (_req, res) =>
  res.status(200).json({
    success: true,
    message: "Service is healthy",
    data: { environment: env.NODE_ENV, timestamp: new Date().toISOString() },
  })
);

// Swagger
app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(openapi, { explorer: true }));
app.get("/api/v1/docs.json", (_req, res) => res.json(openapi));

// API version 1
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/records", recordRoutes);
app.use("/api/v1/favorites", favoriteRoutes);   
app.use("/api/v1/admin/records", adminRecordRoutes);

// Error handlers must be last
app.use(notFound);
app.use(errorHandler);

module.exports = app;
