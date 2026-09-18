jest.mock("../src/models/User", () => ({ findById: jest.fn() }));
jest.mock("../src/utils/token", () => ({
  signToken: jest.fn(),
  verifyToken: jest.fn(() => ({ sub: "507f1f77bcf86cd799439011", iat: 1_700_000_000 })),
}));
jest.mock("../src/services/favoriteService", () => ({
  listFavorites: jest.fn(), saveFavorite: jest.fn(), removeFavorite: jest.fn(),
}));

const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");
const favoriteService = require("../src/services/favoriteService");

function authenticate() {
  User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({
    _id: "507f1f77bcf86cd799439011", role: "user", isActive: true,
    changedPasswordAfter: jest.fn(() => false),
  }) });
}

describe("favorite routes", () => {
  beforeEach(() => jest.clearAllMocks());

  test("requires authentication", async () => {
    const response = await request(app).get("/api/v1/favorites");
    expect(response.status).toBe(401);
  });

  test("lists, saves and removes the current user's favorites", async () => {
    authenticate();
    favoriteService.listFavorites.mockResolvedValue({ favorites: [], pagination: { currentPage: 1, pageSize: 10, totalRecords: 0, totalPages: 0 } });
    const listed = await request(app).get("/api/v1/favorites").set("Authorization", "Bearer user-token");
    expect(listed.status).toBe(200);

    authenticate();
    favoriteService.saveFavorite.mockResolvedValue({ favorite: { record: { slug: "search-course" } }, created: true });
    const saved = await request(app).post("/api/v1/favorites/search-course").set("Authorization", "Bearer user-token");
    expect(saved.status).toBe(201);

    authenticate();
    favoriteService.removeFavorite.mockResolvedValue(undefined);
    const removed = await request(app).delete("/api/v1/favorites/search-course").set("Authorization", "Bearer user-token");
    expect(removed.status).toBe(200);
  });
});
