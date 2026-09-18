// Implements required/optional authentication and role authorization.

const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { verifyToken } = require("../utils/token");

function readBearerToken(req) {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith("Bearer ")) return null;
  return authorization.slice(7).trim();
}

async function loadUserFromToken(token) {
  const payload = verifyToken(token);
  const user = await User.findById(payload.sub).select("+passwordChangedAt");
  if (!user || !user.isActive) {
    throw new AppError("The account for this token is unavailable", 401);
  }
  if (user.changedPasswordAfter(payload.iat)) {
    throw new AppError("Password changed after this token was issued. Please log in again", 401);
  }
  return user;
}

const protect = asyncHandler(async (req, _res, next) => {
  const token = readBearerToken(req);
  if (!token) throw new AppError("Authentication is required", 401);

  try {
    req.user = await loadUserFromToken(token);
    next();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Invalid or expired authentication token", 401);
  }
});

const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = readBearerToken(req);
  if (!token) return next();

  try {
    req.user = await loadUserFromToken(token);
    return next();
  } catch (_error) {
    return next(new AppError("Invalid or expired authentication token", 401));
  }
});

function authorize(...roles) {
  return function authorizationMiddleware(req, _res, next) {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action", 403));
    }
    return next();
  };
}

module.exports = { protect, optionalAuth, authorize };
