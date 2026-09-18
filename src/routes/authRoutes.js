// Defines authentication endpoint URLs and middleware.

const express = require("express");
const authController = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} = require("../validations/authValidation");

const router = express.Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.get("/me", protect, authController.getMe);
router.patch(
  "/change-password",
  protect,
  validate(changePasswordSchema),
  authController.changePassword
);

module.exports = router;
