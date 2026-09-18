// Converts application and database errors into safe JSON responses.

const env = require("../config/env");

function normalizeError(error) {
  if (error.name === "CastError") {
    return { statusCode: 400, message: `Invalid ${error.path}` };
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || "field";
    return { statusCode: 409, message: `A record with that ${field} already exists` };
  }

  if (error.name === "ValidationError") {
    return {
      statusCode: 400,
      message: "Database validation failed",
      details: Object.values(error.errors).map((item) => item.message),
    };
  }

  return {
    statusCode: error.statusCode || 500,
    message: error.isOperational ? error.message : "Something went wrong",
    details: error.details,
  };
}

module.exports = function errorHandler(error, _req, res, _next) {
  const normalized = normalizeError(error);
  const response = {
    success: false,
    message: normalized.message,
    data: null,
  };

  if (normalized.details) response.errors = normalized.details;
  if (env.NODE_ENV === "development" && !error.isOperational) {
    response.debug = { name: error.name, stack: error.stack };
  }

  res.status(normalized.statusCode).json(response);
};