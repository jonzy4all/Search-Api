const {
  favoriteIdentifierSchema,
  favoriteListSchema,
} = require("../src/validations/favoriteValidation");

describe("favorite validation", () => {
  test("accepts a record ID or slug as the favorite identifier", () => {
    const result = favoriteIdentifierSchema.safeParse({
      body: {},
      query: {},
      params: { identifier: "nodejs-backend-engineering" },
    });

    expect(result.success).toBe(true);
  });

  test("transforms favorite pagination and enforces the maximum limit", () => {
    const valid = favoriteListSchema.safeParse({
      body: {},
      params: {},
      query: { page: "2", limit: "20" },
    });
    const invalid = favoriteListSchema.safeParse({
      body: {},
      params: {},
      query: { limit: "101" },
    });

    expect(valid.success).toBe(true);
    expect(valid.data.query).toEqual({ page: 2, limit: 20 });
    expect(invalid.success).toBe(false);
  });
});
