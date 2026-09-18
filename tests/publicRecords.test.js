jest.mock("../src/services/recordService", () => ({
  searchRecords: jest.fn().mockResolvedValue({
    records: [],
    pagination: {
      currentPage: 1,
      pageSize: 10,
      totalRecords: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  }),
  findRecord: jest.fn().mockResolvedValue({
    _id: "66d754b2e25b5c18a9020c11",
    title: "Public record",
    status: "published",
  }),
  createRecord: jest.fn(),
  updateRecord: jest.fn(),
  deleteRecord: jest.fn(),
}));

const request = require("supertest");
const app = require("../src/app");
const recordService = require("../src/services/recordService");

describe("public record access", () => {
  test("searches published records without an Authorization header", async () => {
    const response = await request(app).get("/api/v1/records?page=1&limit=10");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(recordService.searchRecords).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 10 }),
      false
    );
  });

  test("views a published record without an Authorization header", async () => {
    const response = await request(app).get("/api/v1/records/public-record");

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("published");
    expect(recordService.findRecord).toHaveBeenCalledWith("public-record", false);
  });
});
