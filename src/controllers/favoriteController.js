const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const favoriteService = require("../services/favoriteService");

exports.listFavorites = asyncHandler(async (req, res) => {
  const result = await favoriteService.listFavorites(req.user._id, req.validated.query);
  return successResponse(res, {
    message: "Favorites retrieved successfully",
    data: result.favorites,
    meta: { pagination: result.pagination },
  });
});

exports.saveFavorite = asyncHandler(async (req, res) => {
  const result = await favoriteService.saveFavorite(
    req.user._id,
    req.validated.params.identifier
  );

  return successResponse(res, {
    statusCode: result.created ? 201 : 200,
    message: result.created
      ? "Record saved to favorites"
      : "Record is already in your favorites",
    data: result.favorite,
  });
});

exports.removeFavorite = asyncHandler(async (req, res) => {
  await favoriteService.removeFavorite(req.user._id, req.validated.params.identifier);
  return successResponse(res, {
    message: "Record removed from favorites",
    data: null,
  });
});
