const express = require("express");

const recordController = require(
  "../controllers/recordController"
);

const validate = require(
  "../middleware/validate"
);

const {
  recordIdentifierSchema,
  searchRecordsSchema,
} = require(
  "../validations/recordValidation"
);

const router = express.Router();

// Public search: no registration or login required
router.get(
  "/",
  validate(searchRecordsSchema),
  recordController.searchPublicRecords
);

// Public record details: no login required
router.get(
  "/:identifier",
  validate(recordIdentifierSchema),
  recordController.getPublicRecord
);

module.exports = router;