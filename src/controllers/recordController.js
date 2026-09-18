const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const recordService = require("../services/recordService");

// Public: search published records without login
exports.searchPublicRecords = asyncHandler(
  async (req, res) => {
    const result = await recordService.searchRecords(
      req.validated.query,
      false
    );

    return successResponse(res, {
      message: "Records retrieved successfully",
      data: result.records,
      meta: {
        pagination: result.pagination,
      },
    });
  }
);

// Public: view one published record
exports.getPublicRecord = asyncHandler(
  async (req, res) => {
    const record = await recordService.findRecord(
      req.validated.params.identifier,
      false
    );

    return successResponse(res, {
      message: "Record retrieved successfully",
      data: record,
    });
  }
);

// Admin: search records of every status
exports.searchAdminRecords = asyncHandler(
  async (req, res) => {
    const result = await recordService.searchRecords(
      req.validated.query,
      true
    );

    return successResponse(res, {
      message: "Admin records retrieved successfully",
      data: result.records,
      meta: {
        pagination: result.pagination,
      },
    });
  }
);

// Admin: view a record of any status
exports.getAdminRecord = asyncHandler(
  async (req, res) => {
    const record = await recordService.findRecord(
      req.validated.params.identifier,
      true
    );

    return successResponse(res, {
      message: "Admin record retrieved successfully",
      data: record,
    });
  }
);

// Admin: create record
exports.createRecord = asyncHandler(
  async (req, res) => {
    const record = await recordService.createRecord(
      req.validated.body,
      req.user._id
    );

    return successResponse(res, {
      statusCode: 201,
      message: "Record created successfully",
      data: record,
    });
  }
);

// Admin: update record
exports.updateRecord = asyncHandler(
  async (req, res) => {
    const record = await recordService.updateRecord(
      req.validated.params.identifier,
      req.validated.body
    );

    return successResponse(res, {
      message: "Record updated successfully",
      data: record,
    });
  }
);

// Admin: delete record
exports.deleteRecord = asyncHandler(
  async (req, res) => {
    await recordService.deleteRecord(
      req.validated.params.identifier
    );

    return successResponse(res, {
      message: "Record deleted successfully",
      data: null,
    });
  }
);