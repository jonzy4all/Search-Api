const express = require("express");

const recordController = require(
  "../controllers/recordController"
);

const {
  protect,
  authorize,
} = require("../middleware/auth");

const validate = require("../middleware/validate");

const {
  createRecordSchema,
  updateRecordSchema,
  recordIdentifierSchema,
  adminSearchRecordsSchema,
} = require("../validations/recordValidation");

const router = express.Router();

// Every route below requires an authenticated admin
router.use(protect, authorize("admin"));

router
  .route("/")
  .get(
    validate(adminSearchRecordsSchema),
    recordController.searchAdminRecords
  )
  .post(
    validate(createRecordSchema),
    recordController.createRecord
  );

router
  .route("/:identifier")
  .get(
    validate(recordIdentifierSchema),
    recordController.getAdminRecord
  )
  .patch(
    validate(updateRecordSchema),
    recordController.updateRecord
  )
  .delete(
    validate(recordIdentifierSchema),
    recordController.deleteRecord
  );

module.exports = router;