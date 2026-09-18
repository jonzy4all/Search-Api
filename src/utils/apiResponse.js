// Keeps every successful response in the same structure.

function successResponse(res, { statusCode = 200, message, data = null, meta }) {
  const response = { success: true, message, data };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
}

module.exports = { successResponse };