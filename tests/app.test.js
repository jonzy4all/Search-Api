// Tests the health endpoint and standard 404 response.

const request = require("supertest");
const app = require("../src/app");

describe("application basics", () => {
  test("GET /health returns the standard success structure", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: "Service is healthy",
    });
    expect(response.body.data.timestamp).toBeDefined();
  });

  test("an unknown route returns the standard error structure", async () => {
    const response = await request(app).get("/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: "Route GET /does-not-exist was not found",
      data: null,
    });
  });
});