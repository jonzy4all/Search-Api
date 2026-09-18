const mongoose = require("mongoose");
const Favorite = require("../models/Favorite");
const Record = require("../models/Record");
const AppError = require("../utils/AppError");

function recordIdentifierFilter(identifier) {
  if (mongoose.isValidObjectId(identifier)) return { _id: identifier };
  return { slug: identifier.toLowerCase() };
}

async function saveFavorite(userId, identifier) {
  const record = await Record.findOne({
    ...recordIdentifierFilter(identifier),
    status: "published",
  });

  if (!record) throw new AppError("Published record not found", 404);

  let favorite = await Favorite.findOne({ user: userId, record: record._id }).populate("record");
  if (favorite) return { favorite, created: false };

  try {
    favorite = await Favorite.create({ user: userId, record: record._id });
    await favorite.populate("record");
    return { favorite, created: true };
  } catch (error) {
    if (error.code === 11000) {
      favorite = await Favorite.findOne({ user: userId, record: record._id }).populate("record");
      return { favorite, created: false };
    }
    throw error;
  }
}

async function listFavorites(userId, { page, limit }) {
  const skip = (page - 1) * limit;
  const [result] = await Favorite.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId.toString()) } },
    {
      $lookup: {
        from: Record.collection.name,
        localField: "record",
        foreignField: "_id",
        as: "record",
      },
    },
    { $unwind: "$record" },
    { $match: { "record.status": "published" } },
    { $sort: { createdAt: -1, _id: 1 } },
    {
      $facet: {
        items: [
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 0,
              favoriteId: "$_id",
              savedAt: "$createdAt",
              record: {
                _id: "$record._id",
                title: "$record.title",
                slug: "$record.slug",
                description: "$record.description",
                category: "$record.category",
                tags: "$record.tags",
                status: "$record.status",
                price: "$record.price",
                rating: "$record.rating",
                location: "$record.location",
                createdAt: "$record.createdAt",
                updatedAt: "$record.updatedAt",
              },
            },
          },
        ],
        totals: [{ $count: "count" }],
      },
    },
  ]);

  const favorites = result?.items || [];
  const totalRecords = result?.totals?.[0]?.count || 0;
  const totalPages = totalRecords === 0 ? 0 : Math.ceil(totalRecords / limit);

  return {
    favorites,
    pagination: {
      currentPage: page,
      pageSize: limit,
      totalRecords,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1 && totalPages > 0,
    },
  };
}

async function removeFavorite(userId, identifier) {
  const record = await Record.findOne(recordIdentifierFilter(identifier)).select("_id");
  if (!record) throw new AppError("Record not found", 404);

  const result = await Favorite.deleteOne({ user: userId, record: record._id });
  if (result.deletedCount === 0) throw new AppError("Record is not in your favorites", 404);
}

module.exports = { saveFavorite, listFavorites, removeFavorite };
