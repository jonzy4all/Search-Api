jest.mock("../src/models/User", () => ({ findById: jest.fn() }));
jest.mock("../src/utils/token", () => ({
  signToken: jest.fn(),
  verifyToken: jest.fn(() => ({ sub: "507f1f77bcf86cd799439011", iat: 1_700_000_000 })),
}));
jest.mock("../src/services/recordService", () => ({
  searchRecords: jest.fn().mockResolvedValue({ records: [], pagination: { currentPage: 1, pageSize: 10, totalRecords: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false } }),
  findRecord: jest.fn(),
  createRecord: jest.fn(),
  updateRecord: jest.fn(),
  deleteRecord: jest.fn(),
}));

const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");
const recordService = require("../src/services/recordService");

function selected(value) { return { select: jest.fn().mockResolvedValue(value) }; }
function mockRole(role) {
  User.findById.mockReturnValue(selected({
    _id: "507f1f77bcf86cd799439011", role, isActive: true,
    changedPasswordAfter: jest.fn(() => false),
  }));
}

describe("administrator record authorization and CRUD", () => {
  beforeEach(() => jest.clearAllMocks());

  test("rejects an unauthenticated administrator request", async () => {
    const response = await request(app).get("/api/v1/admin/records");
    expect(response.status).toBe(401);
  });

  test("forbids a normal user from administrator routes", async () => {
    mockRole("user");
    const response = await request(app)
      .get("/api/v1/admin/records")
      .set("Authorization", "Bearer user-token");
    expect(response.status).toBe(403);
  });

  test("allows an administrator to create, update and delete a record", async () => {
    mockRole("admin");
    recordService.createRecord.mockResolvedValue({ _id: "record-id", title: "Search Course", status: "draft" });
    const created = await request(app)
      .post("/api/v1/admin/records")
      .set("Authorization", "Bearer admin-token")
      .send({ title: "Search Course", description: "A sufficiently long description", category: "technology" });
    expect(created.status).toBe(201);

    mockRole("admin");
    recordService.updateRecord.mockResolvedValue({ _id: "record-id", status: "published" });
    const updated = await request(app)
      .patch("/api/v1/admin/records/record-id")
      .set("Authorization", "Bearer admin-token")
      .send({ status: "published" });
    expect(updated.status).toBe(200);

    mockRole("admin");
    recordService.deleteRecord.mockResolvedValue(undefined);
    const deleted = await request(app)
      .delete("/api/v1/admin/records/record-id")
      .set("Authorization", "Bearer admin-token");
    expect(deleted.status).toBe(200);
  });
});
