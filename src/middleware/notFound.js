// Converts unknown routes into a standard 404 error.

const AppError = require("../utils/AppError");

module.exports = function notFound(req, _res, next) {
  next(new AppError(`Route ${req.method} ${req.originalUrl} was not found`, 404));
};