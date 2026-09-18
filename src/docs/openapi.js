// Complete OpenAPI specification served at /api/v1/docs.

const categories = [
  "technology", "education", "health", "finance", "travel",
  "business", "entertainment", "other",
];

const searchParameters = [
  { name: "search", in: "query", schema: { type: "string", maxLength: 120 }, description: "Full-text query across title, tags and description" },
  { name: "category", in: "query", schema: { type: "string" }, description: "One or more comma-separated categories" },
  { name: "tags", in: "query", schema: { type: "string" }, description: "Comma-separated tags; every supplied tag must match" },
  { name: "minPrice", in: "query", schema: { type: "number", minimum: 0 } },
  { name: "maxPrice", in: "query", schema: { type: "number", minimum: 0 } },
  { name: "minRating", in: "query", schema: { type: "number", minimum: 0, maximum: 5 } },
  { name: "city", in: "query", schema: { type: "string" } },
  { name: "country", in: "query", schema: { type: "string" } },
  { name: "createdFrom", in: "query", schema: { type: "string", format: "date-time" } },
  { name: "createdTo", in: "query", schema: { type: "string", format: "date-time" } },
  { name: "sortBy", in: "query", schema: { type: "string", enum: ["relevance", "createdAt", "updatedAt", "title", "price", "rating"], default: "relevance" } },
  { name: "sortOrder", in: "query", schema: { type: "string", enum: ["asc", "desc"], default: "desc" } },
  { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
  { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 10 } },
];

const identifierParameter = {
  name: "identifier", in: "path", required: true,
  schema: { type: "string" }, description: "Record MongoDB ID or slug",
};

const recordInputProperties = {
  title: { type: "string", minLength: 2, maxLength: 160 },
  description: { type: "string", minLength: 10, maxLength: 5000 },
  category: { type: "string", enum: categories },
  tags: { type: "array", maxItems: 20, items: { type: "string" } },
  status: { type: "string", enum: ["draft", "published", "archived"], default: "draft" },
  price: { type: "number", minimum: 0, default: 0 },
  rating: { type: "number", minimum: 0, maximum: 5, default: 0 },
  location: { type: "object", properties: { city: { type: "string" }, country: { type: "string" } } },
};

const errorContent = {
  "application/json": { schema: { $ref: "#/components/schemas/Error" } },
};

module.exports = {
  openapi: "3.0.3",
  info: {
    title: "Search API",
    version: "1.1.0",
    description: "Public search for published records, authenticated favorites, and administrator catalogue management.",
  },
  servers: [{ url: "{{baseUrl}}", description: "Local development" }],
  tags: [
    { name: "Authentication" }, { name: "Public Records" },
    { name: "Favorites" }, { name: "Administrator Records" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string", example: "Kate Jonathan" },
          email: { type: "string", format: "email", example: "kate@example.com" },
          role: { type: "string", enum: ["user", "admin"] },
          isActive: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Record: {
        type: "object",
        properties: {
          _id: { type: "string", example: "66d754b2e25b5c18a9020c11" },
          title: { type: "string", example: "Node.js Backend Engineering" },
          slug: { type: "string", example: "nodejs-backend-engineering" },
          description: { type: "string", example: "A practical guide to building secure REST APIs." },
          category: { type: "string", enum: categories },
          tags: { type: "array", items: { type: "string" }, example: ["nodejs", "api"] },
          status: { type: "string", enum: ["draft", "published", "archived"] },
          price: { type: "number", minimum: 0, example: 25000 },
          rating: { type: "number", minimum: 0, maximum: 5, example: 4.7 },
          location: { type: "object", properties: { city: { type: "string" }, country: { type: "string" } } },
          createdBy: { type: "object", properties: { _id: { type: "string" }, name: { type: "string" } } },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      RecordInput: {
        type: "object",
        required: ["title", "description", "category"],
        properties: recordInputProperties,
      },
      RecordUpdate: {
        type: "object",
        minProperties: 1,
        properties: recordInputProperties,
      },
      Error: {
        type: "object", required: ["success", "message", "data"],
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Validation failed" },
          data: { nullable: true, example: null },
          errors: { type: "array", items: { type: "object" } },
        },
      },
    },
    responses: {
      BadRequest: { description: "Invalid request", content: errorContent },
      Unauthorized: { description: "Authentication failed or is required", content: errorContent },
      Forbidden: { description: "Insufficient permission", content: errorContent },
      NotFound: { description: "Resource not found", content: errorContent },
    },
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Authentication"], summary: "Register a user account for favorites",
        requestBody: { required: true, content: { "application/json": { schema: {
          type: "object", required: ["name", "email", "password", "passwordConfirm"],
          properties: {
            name: { type: "string", example: "Kate Jonathan" },
            email: { type: "string", format: "email", example: "kate@example.com" },
            password: { type: "string", format: "password", example: "Password123!" },
            passwordConfirm: { type: "string", format: "password", example: "Password123!" },
          },
        } } } },
        responses: { 201: { description: "Account created" }, 400: { $ref: "#/components/responses/BadRequest" }, 409: { description: "Email already exists" } },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Authentication"], summary: "Log in and receive a JWT",
        requestBody: { required: true, content: { "application/json": { schema: {
          type: "object", required: ["email", "password"],
          properties: { email: { type: "string", format: "email" }, password: { type: "string", format: "password" } },
        } } } },
        responses: { 200: { description: "Login successful" }, 400: { $ref: "#/components/responses/BadRequest" }, 401: { $ref: "#/components/responses/Unauthorized" } },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Authentication"], summary: "Return the current user or administrator",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Profile returned" }, 401: { $ref: "#/components/responses/Unauthorized" } },
      },
    },
    "/auth/change-password": {
      patch: {
        tags: ["Authentication"], summary: "Change the current user or administrator password",
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: {
          type: "object", required: ["currentPassword", "newPassword", "newPasswordConfirm"],
          properties: {
            currentPassword: { type: "string", format: "password" },
            newPassword: { type: "string", format: "password", example: "NewPassword456!" },
            newPasswordConfirm: { type: "string", format: "password", example: "NewPassword456!" },
          },
        } } } },
        responses: { 200: { description: "Password changed and a new JWT returned" }, 400: { $ref: "#/components/responses/BadRequest" }, 401: { $ref: "#/components/responses/Unauthorized" } },
      },
    },
    "/records": {
      get: {
        tags: ["Public Records"], summary: "Search published records without authentication",
        parameters: searchParameters,
        responses: { 200: { description: "Published records and pagination metadata" }, 400: { $ref: "#/components/responses/BadRequest" } },
      },
    },
    "/records/{identifier}": {
      parameters: [identifierParameter],
      get: {
        tags: ["Public Records"], summary: "View one published record without authentication",
        responses: { 200: { description: "Published record returned" }, 404: { $ref: "#/components/responses/NotFound" } },
      },
    },
    "/favorites": {
      get: {
        tags: ["Favorites"], summary: "List the current user's published favorites",
        security: [{ bearerAuth: [] }],
        parameters: searchParameters.filter((item) => ["page", "limit"].includes(item.name)),
        responses: { 200: { description: "Favorites and pagination metadata" }, 401: { $ref: "#/components/responses/Unauthorized" } },
      },
    },
    "/favorites/{identifier}": {
      parameters: [identifierParameter],
      post: {
        tags: ["Favorites"], summary: "Save a published record", security: [{ bearerAuth: [] }],
        responses: { 201: { description: "Favorite saved" }, 200: { description: "Record already saved" }, 401: { $ref: "#/components/responses/Unauthorized" }, 404: { $ref: "#/components/responses/NotFound" } },
      },
      delete: {
        tags: ["Favorites"], summary: "Remove a favorite", security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Favorite removed" }, 401: { $ref: "#/components/responses/Unauthorized" }, 404: { $ref: "#/components/responses/NotFound" } },
      },
    },
    "/admin/records": {
      get: {
        tags: ["Administrator Records"], summary: "Search records of every status", security: [{ bearerAuth: [] }],
        parameters: [...searchParameters, { name: "status", in: "query", schema: { type: "string", enum: ["draft", "published", "archived"] } }],
        responses: { 200: { description: "Records and pagination metadata" }, 401: { $ref: "#/components/responses/Unauthorized" }, 403: { $ref: "#/components/responses/Forbidden" } },
      },
      post: {
        tags: ["Administrator Records"], summary: "Create a record", security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RecordInput" } } } },
        responses: { 201: { description: "Record created" }, 400: { $ref: "#/components/responses/BadRequest" }, 401: { $ref: "#/components/responses/Unauthorized" }, 403: { $ref: "#/components/responses/Forbidden" } },
      },
    },
    "/admin/records/{identifier}": {
      parameters: [identifierParameter],
      get: {
        tags: ["Administrator Records"], summary: "View a record of any status", security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Record returned" }, 401: { $ref: "#/components/responses/Unauthorized" }, 403: { $ref: "#/components/responses/Forbidden" }, 404: { $ref: "#/components/responses/NotFound" } },
      },
      patch: {
        tags: ["Administrator Records"], summary: "Update or publish a record", security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RecordUpdate" } } } },
        responses: { 200: { description: "Record updated" }, 400: { $ref: "#/components/responses/BadRequest" }, 401: { $ref: "#/components/responses/Unauthorized" }, 403: { $ref: "#/components/responses/Forbidden" }, 404: { $ref: "#/components/responses/NotFound" } },
      },
      delete: {
        tags: ["Administrator Records"], summary: "Delete a record and its favorites", security: [{ bearerAuth: [] }],
        responses: { 200: { description: "Record deleted" }, 401: { $ref: "#/components/responses/Unauthorized" }, 403: { $ref: "#/components/responses/Forbidden" }, 404: { $ref: "#/components/responses/NotFound" } },
      },
    },
  },
};
