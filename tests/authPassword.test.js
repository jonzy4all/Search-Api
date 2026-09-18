jest.mock("../src/models/User", () => ({
  exists: jest.fn(),
  create: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
}));

jest.mock("../src/utils/token", () => ({
  signToken: jest.fn(() => "fresh-jwt-token"),
  verifyToken: jest.fn(() => ({ sub: "507f1f77bcf86cd799439011", iat: 1_700_000_000 })),
}));

const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");
const { verifyToken } = require("../src/utils/token");

function selected(value) {
  return { select: jest.fn().mockResolvedValue(value) };
}

function authenticatedUser(role = "user", changed = false) {
  return {
    _id: "507f1f77bcf86cd799439011",
    name: role === "admin" ? "Admin" : "Kate",
    email: role === "admin" ? "admin@example.com" : "kate@example.com",
    role,
    isActive: true,
    changedPasswordAfter: jest.fn(() => changed),
  };
}

describe("authentication and password changing", () => {
  beforeEach(() => jest.clearAllMocks());

  test("registers a normal user and returns a token", async () => {
    const user = {
      toJSON: () => ({ _id: "507f1f77bcf86cd799439011", email: "kate@example.com", role: "user" }),
    };
    User.exists.mockResolvedValue(false);
    User.create.mockResolvedValue(user);

    const response = await request(app).post("/api/v1/auth/register").send({
      name: "Kate Jonathan",
      email: "kate@example.com",
      password: "Password123!",
      passwordConfirm: "Password123!",
    });

    expect(response.status).toBe(201);
    expect(response.body.data.token).toBe("fresh-jwt-token");
  });

  test("rejects duplicate registration", async () => {
    User.exists.mockResolvedValue(true);
    const response = await request(app).post("/api/v1/auth/register").send({
      name: "Kate Jonathan",
      email: "kate@example.com",
      password: "Password123!",
      passwordConfirm: "Password123!",
    });
    expect(response.status).toBe(409);
  });

  test("logs in with valid credentials", async () => {
    const user = {
      isActive: true,
      comparePassword: jest.fn().mockResolvedValue(true),
      toJSON: () => ({ email: "kate@example.com", role: "user" }),
    };
    User.findOne.mockReturnValue(selected(user));

    const response = await request(app).post("/api/v1/auth/login").send({
      email: "kate@example.com",
      password: "Password123!",
    });
    expect(response.status).toBe(200);
    expect(response.body.data.token).toBe("fresh-jwt-token");
  });

  test("rejects invalid login credentials", async () => {
    User.findOne.mockReturnValue(selected(null));
    const response = await request(app).post("/api/v1/auth/login").send({
      email: "kate@example.com",
      password: "WrongPassword123!",
    });
    expect(response.status).toBe(401);
  });

  test("requires authentication to change a password", async () => {
    const response = await request(app).patch("/api/v1/auth/change-password").send({
      currentPassword: "Password123!",
      newPassword: "NewPassword456!",
      newPasswordConfirm: "NewPassword456!",
    });
    expect(response.status).toBe(401);
  });

  test.each(["user", "admin"])("allows an authenticated %s to change password", async (role) => {
    const authUser = authenticatedUser(role);
    const savedUser = {
      ...authUser,
      password: "hashed-current-password",
      comparePassword: jest.fn().mockResolvedValue(true),
      save: jest.fn().mockResolvedValue(undefined),
      toJSON: () => ({ email: authUser.email, role }),
    };
    User.findById
      .mockReturnValueOnce(selected(authUser))
      .mockReturnValueOnce(selected(savedUser));

    const response = await request(app)
      .patch("/api/v1/auth/change-password")
      .set("Authorization", "Bearer current-token")
      .send({
        currentPassword: "Password123!",
        newPassword: "NewPassword456!",
        newPasswordConfirm: "NewPassword456!",
      });

    expect(response.status).toBe(200);
    expect(savedUser.password).toBe("NewPassword456!");
    expect(savedUser.save).toHaveBeenCalled();
    expect(response.body.data.token).toBe("fresh-jwt-token");
  });

  test("rejects an incorrect current password", async () => {
    const authUser = authenticatedUser();
    const savedUser = {
      ...authUser,
      comparePassword: jest.fn().mockResolvedValue(false),
    };
    User.findById
      .mockReturnValueOnce(selected(authUser))
      .mockReturnValueOnce(selected(savedUser));

    const response = await request(app)
      .patch("/api/v1/auth/change-password")
      .set("Authorization", "Bearer current-token")
      .send({
        currentPassword: "WrongPassword123!",
        newPassword: "NewPassword456!",
        newPasswordConfirm: "NewPassword456!",
      });
    expect(response.status).toBe(401);
  });

  test("rejects a reused or mismatched new password", async () => {
    User.findById.mockReturnValue(selected(authenticatedUser()));
    const reused = await request(app)
      .patch("/api/v1/auth/change-password")
      .set("Authorization", "Bearer current-token")
      .send({
        currentPassword: "Password123!",
        newPassword: "Password123!",
        newPasswordConfirm: "Password123!",
      });
    expect(reused.status).toBe(400);

    User.findById.mockReturnValue(selected(authenticatedUser()));
    const mismatch = await request(app)
      .patch("/api/v1/auth/change-password")
      .set("Authorization", "Bearer current-token")
      .send({
        currentPassword: "Password123!",
        newPassword: "NewPassword456!",
        newPasswordConfirm: "DifferentPassword789!",
      });
    expect(mismatch.status).toBe(400);
  });

  test("rejects a token issued before the password changed", async () => {
    User.findById.mockReturnValue(selected(authenticatedUser("user", true)));
    verifyToken.mockReturnValue({ sub: "507f1f77bcf86cd799439011", iat: 1_600_000_000 });

    const response = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", "Bearer old-token");
    expect(response.status).toBe(401);
  });
});
