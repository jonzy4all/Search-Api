const express = require("express");

const favoriteController = require("../controllers/favoriteController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");

const {
  favoriteIdentifierSchema,
  favoriteListSchema,
} = require("../validations/favoriteValidation");

const router = express.Router();

// Every favorites endpoint requires login
router.use(protect);

// List the current user's favorites
router.get(
  "/",
  validate(favoriteListSchema),
  favoriteController.listFavorites
);

// Save a published record
router.post(
  "/:identifier",
  validate(favoriteIdentifierSchema),
  favoriteController.saveFavorite
);

// Remove a favorite
router.delete(
  "/:identifier",
  validate(favoriteIdentifierSchema),
  favoriteController.removeFavorite
);

module.exports = router;