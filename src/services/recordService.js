// Contains full-text search, filtering, sorting, pagination and record CRUD logic.

const mongoose = require("mongoose");
const slugify = require("slugify");
const Record = require("../models/Record");
const AppError = require("../utils/AppError");
const Favorite = require(
  "../models/Favorite"
);

function splitList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function buildRecordFilter(params, isAdmin = false) {
  const filter = {};

  if (params.search) filter.$text = { $search: params.search };

  const categories = splitList(params.category);
  if (categories.length) filter.category = { $in: categories };

  const tags = splitList(params.tags);
  if (tags.length) filter.tags = { $all: tags };

 if (isAdmin) {
  if (params.status) {
    filter.status = params.status;
  }
} else {
  filter.status = "published";
}

  if (params.minPrice !== undefined || params.maxPrice !== undefined) {
    filter.price = {};
    if (params.minPrice !== undefined) filter.price.$gte = params.minPrice;
    if (params.maxPrice !== undefined) filter.price.$lte = params.maxPrice;
  }

  if (params.minRating !== undefined) filter.rating = { $gte: params.minRating };
  if (params.city) filter["location.city"] = params.city.toLowerCase();
  if (params.country) filter["location.country"] = params.country.toLowerCase();

  if (params.createdFrom || params.createdTo) {
    filter.createdAt = {};
    if (params.createdFrom) filter.createdAt.$gte = params.createdFrom;
    if (params.createdTo) filter.createdAt.$lte = params.createdTo;
  }

  return filter;
}

function buildSort(params) {
  if (params.search && params.sortBy === "relevance") {
    return { score: { $meta: "textScore" } };
  }

  const sortField = params.sortBy === "relevance" ? "createdAt" : params.sortBy;
  return { [sortField]: params.sortOrder === "asc" ? 1 : -1, _id: 1 };
}

async function makeUniqueSlug(title, excludedId) {
  const base = slugify(title, { lower: true, strict: true, trim: true }) || "record";
  let candidate = base;
  let suffix = 2;

  while (
    await Record.exists({
      slug: candidate,
      ...(excludedId ? { _id: { $ne: excludedId } } : {}),
    })
  ) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

async function searchRecords(params, isAdmin = false) {
  const filter = buildRecordFilter(params, isAdmin);
  const projection = params.search ? { score: { $meta: "textScore" } } : undefined;
  const skip = (params.page - 1) * params.limit;

  const query = Record.find(filter, projection)
    .sort(buildSort(params))
    .skip(skip)
    .limit(params.limit)
    .populate("createdBy", "name")
    .lean();

  const [records, totalRecords] = await Promise.all([
    query.exec(),
    Record.countDocuments(filter),
  ]);

  const totalPages = totalRecords === 0 ? 0 : Math.ceil(totalRecords / params.limit);
  return {
    records,
    pagination: {
      currentPage: params.page,
      pageSize: params.limit,
      totalRecords,
      totalPages,
      hasNextPage: params.page < totalPages,
      hasPreviousPage: params.page > 1 && totalPages > 0,
    },
  };
}

function identifierFilter(identifier) {
  if (mongoose.isValidObjectId(identifier)) return { _id: identifier };
  return { slug: identifier.toLowerCase() };
}

async function findRecord(identifier, canViewUnpublished = false) {
  const filter = identifierFilter(identifier);
  if (!canViewUnpublished) filter.status = "published";

  const record = await Record.findOne(filter).populate("createdBy", "name");
  if (!record) throw new AppError("Record not found", 404);
  return record;
}

async function createRecord(payload, userId) {
  const slug = await makeUniqueSlug(payload.title);
  return Record.create({ ...payload, slug, createdBy: userId });
}

async function updateRecord(identifier, payload) {
  const record = await Record.findOne(identifierFilter(identifier));
  if (!record) throw new AppError("Record not found", 404);

  if (payload.title && payload.title !== record.title) {
    payload.slug = await makeUniqueSlug(payload.title, record._id);
  }

  Object.assign(record, payload);
  await record.save();
  return record;
}

async function deleteRecord(identifier) {
  const record =
    await Record.findOneAndDelete(
      identifierFilter(identifier)
    );

  if (!record) {
    throw new AppError(
      "Record not found",
      404
    );
  }

  await Favorite.deleteMany({
    record: record._id,
  });

  return record;
}

module.exports = {
  splitList,
  buildRecordFilter,
  buildSort,
  searchRecords,
  findRecord,
  createRecord,
  updateRecord,
  deleteRecord,
};