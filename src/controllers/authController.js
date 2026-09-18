// Implements registration, login and current-profile responses.

const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const { signToken } = require("../utils/token");

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.validated.body;

  if (await User.exists({ email })) {
    throw new AppError("An account with this email already exists", 409);
  }

  const user = await User.create({ name, email, password });
  const token = signToken(user);

  return successResponse(res, {
    statusCode: 201,
    message: "Account created successfully",
    data: { user: user.toJSON(), token },
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user || !user.isActive || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken(user);
  return successResponse(res, {
    message: "Login successful",
    data: { user: user.toJSON(), token },
  });
});

exports.getMe = asyncHandler(async (req, res) =>
  successResponse(res, {
    message: "Profile retrieved successfully",
    data: { user: req.user },
  })
);

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.validated.body;
  const user = await User.findById(req.user._id).select("+password");

  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new AppError("Current password is incorrect", 401);
  }

  user.password = newPassword;
  await user.save();

  // Password changes invalidate previously issued tokens. Return a fresh one.
  const token = signToken(user);
  return successResponse(res, {
    message: "Password changed successfully",
    data: { user: user.toJSON(), token },
  });
});
