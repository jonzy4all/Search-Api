const { z } = require("zod");

const categories = [
  "technology",
  "education",
  "health",
  "finance",
  "travel",
  "business",
  "entertainment",
  "other",
];

const statusValues = [
  "draft",
  "published",
  "archived",
];

const emptyToUndefined = (value) => {
  return value === "" ? undefined : value;
};

const commaSeparatedCategories = z
  .string()
  .trim()
  .max(200)
  .transform((value) =>
    value
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
  )
  .refine(
    (values) =>
      values.length > 0 &&
      values.every((value) =>
        categories.includes(value)
      ),
    {
      message:
        `Categories must be one or more of: ${categories.join(", ")}`,
    }
  );

const commaSeparatedTags = z
  .string()
  .trim()
  .max(300)
  .transform((value) =>
    value
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
  )
  .refine(
    (values) =>
      values.length > 0 &&
      values.length <= 20,
    {
      message: "Provide between 1 and 20 tags",
    }
  );

const locationSchema = z
  .object({
    city: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .optional(),

    country: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .optional(),
  })
  .optional();

const recordBodySchema = z.object({
  title: z
    .string()
    .trim()
    .min(2)
    .max(160),

  description: z
    .string()
    .trim()
    .min(10)
    .max(5000),

  category: z.enum(categories),

  tags: z
    .array(
      z.string().trim().min(1).max(50)
    )
    .max(20)
    .default([]),

  status: z
    .enum(statusValues)
    .default("draft"),

  price: z
    .number()
    .min(0)
    .default(0),

  rating: z
    .number()
    .min(0)
    .max(5)
    .default(0),

  location: locationSchema,
});

const createRecordSchema = z.object({
  body: recordBodySchema,

  query: z
    .object({})
    .passthrough(),

  params: z
    .object({})
    .passthrough(),
});

const updateRecordSchema = z.object({
  body: recordBodySchema
    .partial()
    .refine(
      (body) => Object.keys(body).length > 0,
      {
        message:
          "Provide at least one field to update",
      }
    ),

  query: z
    .object({})
    .passthrough(),

  params: z.object({
    identifier: z
      .string()
      .trim()
      .min(1)
      .max(200),
  }),
});

const recordIdentifierSchema = z.object({
  body: z
    .object({})
    .passthrough(),

  query: z
    .object({})
    .passthrough(),

  params: z.object({
    identifier: z
      .string()
      .trim()
      .min(1)
      .max(200),
  }),
});

const searchQuerySchema = z
  .object({
    search: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .trim()
        .min(1)
        .max(120)
        .optional()
    ),

    category: z.preprocess(
      emptyToUndefined,
      commaSeparatedCategories.optional()
    ),

    tags: z.preprocess(
      emptyToUndefined,
      commaSeparatedTags.optional()
    ),

    minPrice: z.preprocess(
      emptyToUndefined,
      z.coerce
        .number()
        .min(0)
        .optional()
    ),

    maxPrice: z.preprocess(
      emptyToUndefined,
      z.coerce
        .number()
        .min(0)
        .optional()
    ),

    minRating: z.preprocess(
      emptyToUndefined,
      z.coerce
        .number()
        .min(0)
        .max(5)
        .optional()
    ),

    city: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .trim()
        .max(100)
        .optional()
    ),

    country: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .trim()
        .max(100)
        .optional()
    ),

    createdFrom: z.preprocess(
      emptyToUndefined,
      z.coerce.date().optional()
    ),

    createdTo: z.preprocess(
      emptyToUndefined,
      z.coerce.date().optional()
    ),

    sortBy: z
      .enum([
        "relevance",
        "createdAt",
        "updatedAt",
        "title",
        "price",
        "rating",
      ])
      .default("relevance"),

    sortOrder: z
      .enum(["asc", "desc"])
      .default("desc"),

    page: z.coerce
      .number()
      .int()
      .min(1)
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(10),
  })
  .strict();

function addRangeChecks(schema) {
  return schema.superRefine(
    (data, ctx) => {
      const {
        minPrice,
        maxPrice,
        createdFrom,
        createdTo,
      } = data.query;

      if (
        minPrice !== undefined &&
        maxPrice !== undefined &&
        minPrice > maxPrice
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["query", "maxPrice"],
          message:
            "maxPrice must be at least minPrice",
        });
      }

      if (
        createdFrom &&
        createdTo &&
        createdFrom > createdTo
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["query", "createdTo"],
          message:
            "createdTo must be after createdFrom",
        });
      }
    }
  );
}

// Public search validation.
// Status filtering is not allowed here.
const searchRecordsSchema = addRangeChecks(
  z.object({
    body: z
      .object({})
      .passthrough(),

    params: z
      .object({})
      .passthrough(),

    query: searchQuerySchema,
  })
);

// Administrator search validation.
// Admins can additionally filter records by status.
const adminSearchRecordsSchema =
  addRangeChecks(
    z.object({
      body: z
        .object({})
        .passthrough(),

      params: z
        .object({})
        .passthrough(),

      query: searchQuerySchema.extend({
        status: z.preprocess(
          emptyToUndefined,
          z
            .enum(statusValues)
            .optional()
        ),
      }),
    })
  );

module.exports = {
  categories,
  statusValues,
  createRecordSchema,
  updateRecordSchema,
  recordIdentifierSchema,
  searchRecordsSchema,
  adminSearchRecordsSchema,
};