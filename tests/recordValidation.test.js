// Tests pagination, ranges, categories and safe sort validation.

const {
  createRecordSchema,
  searchRecordsSchema,
} = require("../src/validations/recordValidation");

describe("record validation", () => {
  test("accepts and transforms valid pagination values", () => {
    const result = searchRecordsSchema.safeParse({
      body: {},
      params: {},
      query: { page: "2", limit: "25", minRating: "4.5" },
    });

    expect(result.success).toBe(true);
    expect(result.data.query).toMatchObject({ page: 2, limit: 25, minRating: 4.5 });
  });

  test("rejects an unsafe or unsupported sort field", () => {
    const result = searchRecordsSchema.safeParse({
      body: {},
      params: {},
      query: { sortBy: "password" },
    });

    expect(result.success).toBe(false);
  });

  test("normalizes supported category filters and rejects unknown categories", () => {
    const valid = searchRecordsSchema.safeParse({
      body: {},
      params: {},
      query: { category: "Technology, Education" },
    });
    const invalid = searchRecordsSchema.safeParse({
      body: {},
      params: {},
      query: { category: "secret-system-field" },
    });

    expect(valid.success).toBe(true);
    expect(valid.data.query.category).toEqual(["technology", "education"]);
    expect(invalid.success).toBe(false);
  });

  test("rejects an invalid price range", () => {
    const result = searchRecordsSchema.safeParse({
      body: {},
      params: {},
      query: { minPrice: "500", maxPrice: "100" },
    });

    expect(result.success).toBe(false);
  });

  test("rejects a record with a short description", () => {
    const result = createRecordSchema.safeParse({
      body: {
        title: "API",
        description: "Too short",
        category: "technology",
      },
      query: {},
      params: {},
    });

    expect(result.success).toBe(false);
  });
});