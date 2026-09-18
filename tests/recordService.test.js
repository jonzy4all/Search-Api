// Tests filters, publication privacy and sorting.

const {
  splitList,
  buildRecordFilter,
  buildSort,
} = require("../src/services/recordService");

describe("record search query construction", () => {
  test("normalizes comma-separated filters", () => {
    expect(splitList("Technology, API, nodeJS")).toEqual(["technology", "api", "nodejs"]);
  });

  test("builds public filters and always enforces published status", () => {
    const filter = buildRecordFilter(
      {
        search: "node backend",
        category: "technology,education",
        tags: "nodejs,api",
        status: "draft",
        minPrice: 100,
        maxPrice: 500,
        minRating: 4,
        country: "Nigeria",
      },
      false
    );

    expect(filter).toEqual({
      $text: { $search: "node backend" },
      category: { $in: ["technology", "education"] },
      tags: { $all: ["nodejs", "api"] },
      status: "published",
      price: { $gte: 100, $lte: 500 },
      rating: { $gte: 4 },
      "location.country": "nigeria",
    });
  });

  test("allows an admin to include unpublished records", () => {
    expect(buildRecordFilter({ includeUnpublished: true }, true)).toEqual({});
    expect(buildRecordFilter({ status: "draft" }, true)).toEqual({ status: "draft" });
  });

  test("uses text score for relevant search and a safe allow-listed field otherwise", () => {
    expect(buildSort({ search: "api", sortBy: "relevance", sortOrder: "desc" })).toEqual({
      score: { $meta: "textScore" },
    });
    expect(buildSort({ sortBy: "price", sortOrder: "asc" })).toEqual({ price: 1, _id: 1 });
  });
});