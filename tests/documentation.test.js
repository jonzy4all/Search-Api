const fs = require("fs");
const path = require("path");
const openapi = require("../src/docs/openapi");

function collectRequests(items, output = []) {
  for (const item of items) {
    if (item.request) output.push(item.request);
    if (item.item) collectRequests(item.item, output);
  }
  return output;
}

describe("API documentation", () => {
  test("OpenAPI documents the real public, favorite and admin routes", () => {
    expect(openapi.paths["/records"].get).toBeDefined();
    expect(openapi.paths["/records"].post).toBeUndefined();
    expect(openapi.paths["/favorites/{identifier}"].post).toBeDefined();
    expect(openapi.paths["/admin/records"].post).toBeDefined();
    expect(openapi.paths["/auth/change-password"].patch).toBeDefined();
  });

  test("Postman collection uses correct routes and authentication", () => {
    const file = path.join(__dirname, "..", "postman", "Search_API.postman_collection.json");
    const collection = JSON.parse(fs.readFileSync(file, "utf8"));
    const requests = collectRequests(collection.item);
    const publicView = requests.find((request) => String(request.url) === "{{baseUrl}}/records/{{recordIdentifier}}");
    const favorites = requests.find((request) => String(request.url).includes("/favorites?page"));
    expect(publicView.auth.type).toBe("noauth");
    expect(favorites.auth.type).toBe("bearer");
  });
});
