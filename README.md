# Hajime Search API

A production-minded backend MVP for **Capstone Topic 25: Search API**. It lets clients search a catalogue of records with full-text search, filters, safe sorting and pagination. Admin users manage the records that power the search experience.

**Access rule:** anyone may browse and search published records. An account is required only to save personal favorites; administrator authentication is required to manage records.

## Problem and target users

Applications commonly need a reusable way to discover a large number of records without downloading the complete dataset. This API solves that problem for:

- Client applications that need fast, predictable catalogue search.
- Public users who browse and search published records without an account.
- Registered users who save and manage personal favorites.
- Administrators who create, publish, update, archive and delete records.

## MVP features

- Completely public browsing, full-text search, filtering, sorting and pagination.
- Optional registration/login for saving personal favorites.
- Password hashing with bcrypt.
- User and admin roles with protected admin routes.
- Secure password changing for both users and administrators, with current-password verification and old-token invalidation.
- Save, list and remove favorite records.
- Record CRUD operations.
- MongoDB weighted full-text search over title, tags and description.
- Filters for category, tags, status, price, rating, location and creation date.
- Safe, allow-listed sorting by relevance, date, title, price or rating.
- Pagination with current page, page size, total records, total pages and next/previous flags.
- Backend validation with Zod.
- Centralized errors and consistent JSON responses.
- Security headers, CORS, request-size limits and rate limiting.
- Swagger/OpenAPI documentation and an importable Postman collection.
- Jest tests and a Render deployment blueprint.

## Technology stack

- Node.js 20+
- Express 5
- MongoDB and Mongoose
- JSON Web Tokens and bcrypt
- Zod validation
- Swagger UI / OpenAPI 3
- Jest and Supertest

## Architecture

```text
src/
├── config/         Environment and database configuration
├── controllers/    HTTP request and response handling
├── docs/           OpenAPI specification
├── middleware/     Auth, roles, validation and errors
├── models/         Mongoose data models and indexes
├── routes/         Versioned endpoint definitions
├── services/       Search and record business logic
├── utils/          Tokens, errors and response helpers
├── validations/    Zod request schemas
├── app.js          Express application
└── server.js       Database connection and process lifecycle
```

The request flow follows the capstone guideline:

```text
Client -> Route -> Middleware -> Validation -> Controller -> Service -> Database -> Response
```

## Data model

### User

| Field | Type | Notes |
| --- | --- | --- |
| name | String | Required |
| email | String | Required, normalized, unique, indexed |
| password | String | Hashed, hidden from normal queries/responses |
| role | Enum | `user` or `admin` |
| isActive | Boolean | Allows account access to be disabled |
| passwordChangedAt | Date | Invalidates JWTs issued before a password change; hidden from responses |
| timestamps | Date | `createdAt`, `updatedAt` |

### Record

| Field | Type | Notes |
| --- | --- | --- |
| title | String | Required; highest text-search weight |
| slug | String | Unique human-readable identifier |
| description | String | Required; searchable |
| category | Enum | Indexed filter |
| tags | String[] | Searchable; supports all-tags filtering |
| status | Enum | `draft`, `published`, `archived` |
| price | Number | Minimum 0; range filter and sort |
| rating | Number | 0-5; threshold filter and sort |
| location | Object | City and country filters |
| createdBy | ObjectId | Reference to the admin user |
| timestamps | Date | Date filtering and sorting |

Important indexes include a weighted text index and compound indexes for common status/category/date and status/price/rating queries.

### Favorite

| Field | Type | Notes |
| --- | --- | --- |
| user | ObjectId | Reference to the registered user |
| record | ObjectId | Reference to the saved record |
| timestamps | Date | Includes the date the record was saved |

A compound unique index on `user + record` prevents the same user from saving the same record twice.

## Installation

1. Install Node.js 20 or newer and MongoDB, or create a MongoDB Atlas database.
2. Open a terminal in this project folder.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Copy the example environment file:

   **Windows PowerShell**

   ```powershell
   Copy-Item .env.example .env
   ```

   **macOS/Linux**

   ```bash
   cp .env.example .env
   ```

5. Edit `.env`, especially `MONGO_URI`, `JWT_SECRET`, `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
6. Seed an admin and sample records:

   ```bash
   npm run seed
   ```

7. Start development mode:

   ```bash
   npm run dev
   ```

The server runs at `http://localhost:5000` unless `PORT` is changed.

## Environment variables

| Variable | Required in production | Purpose |
| --- | --- | --- |
| `NODE_ENV` | Yes | `development`, `test` or `production` |
| `PORT` | No | HTTP port; defaults to 5000 |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Random secret of at least 32 characters |
| `JWT_EXPIRES_IN` | No | Token lifetime; defaults to `1d` |
| `CORS_ORIGIN` | Yes | Allowed frontend origin(s), comma-separated |
| `RATE_LIMIT_WINDOW_MS` | No | Rate-limit window |
| `RATE_LIMIT_MAX` | No | Maximum API requests per window |
| `ADMIN_NAME` | Seed only | Initial admin name |
| `ADMIN_EMAIL` | Seed only | Initial admin email |
| `ADMIN_PASSWORD` | Seed only | Initial admin password |

Never commit `.env`. The included `.gitignore` excludes it and `node_modules/`.

## API endpoints

Base URL: `/api/v1`

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | Register a normal user |
| POST | `/auth/login` | Public | Log in and receive a JWT |
| GET | `/auth/me` | Authenticated | Return the current profile |
| PATCH | `/auth/change-password` | Authenticated user/admin | Verify the current password, change it and return a fresh JWT |
| GET | `/records` | Public, no token | Search published records |
| GET | `/records/:identifier` | Public, no token | View a published record by ID or slug |
| GET | `/favorites` | Authenticated user | List personal favorites |
| POST | `/favorites/:identifier` | Authenticated user | Save a published record |
| DELETE | `/favorites/:identifier` | Authenticated user | Remove a favorite |
| GET | `/admin/records` | Admin | Search records of any status |
| POST | `/admin/records` | Admin | Create a record |
| GET | `/admin/records/:identifier` | Admin | View any record |
| PATCH | `/admin/records/:identifier` | Admin | Update or publish a record |
| DELETE | `/admin/records/:identifier` | Admin | Delete a record and its favorites |

No registration or login is required to use the public record endpoints. They always return `published` records. Authentication becomes necessary only when a user wants to save/list/remove favorites, or when an administrator manages the catalogue.

### Change a user or administrator password

Both roles use the same protected endpoint:

```http
PATCH /api/v1/auth/change-password
Authorization: Bearer YOUR_CURRENT_TOKEN
Content-Type: application/json
```

```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword456!",
  "newPasswordConfirm": "NewPassword456!"
}
```

The current password must be correct, the new password must meet the password rules, and it cannot equal the current password. A successful response returns a fresh JWT. Tokens issued before the password change are rejected.

## Search query parameters

| Parameter | Example | Meaning |
| --- | --- | --- |
| `search` | `backend api` | Weighted text search |
| `category` | `technology,education` | Match any listed category |
| `tags` | `nodejs,api` | Record must contain all listed tags |
| `minPrice` / `maxPrice` | `1000` / `50000` | Inclusive price range |
| `minRating` | `4` | Minimum rating |
| `city` / `country` | `lagos` / `nigeria` | Exact normalized location |
| `createdFrom` / `createdTo` | ISO date | Creation date range |
| `sortBy` | `relevance`, `createdAt`, `updatedAt`, `title`, `price`, `rating` | Allow-listed sort field |
| `sortOrder` | `asc` or `desc` | Sort direction |
| `page` | `2` | Page number, starting at 1 |
| `limit` | `20` | Page size, maximum 100 |

The administrator endpoint `/api/v1/admin/records` also accepts `status=draft`, `status=published` or `status=archived`.

Example:

```http
GET /api/v1/records?search=node%20api&category=technology&tags=nodejs&minRating=4&sortBy=rating&sortOrder=desc&page=1&limit=10
```

Successful paginated response:

```json
{
  "success": true,
  "message": "Records retrieved successfully",
  "data": [],
  "meta": {
    "pagination": {
      "currentPage": 1,
      "pageSize": 10,
      "totalRecords": 0,
      "totalPages": 0,
      "hasNextPage": false,
      "hasPreviousPage": false
    }
  }
}
```

Validation/error response:

```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "errors": [
    {
      "field": "query.limit",
      "message": "Too big: expected number to be <=100"
    }
  ]
}
```

## Complete demonstration flow

1. Search immediately without registering: `GET /api/v1/records?search=<term>`.
2. Register with `POST /api/v1/auth/register` only when favorites are needed.
3. Demonstrate user password changing with `PATCH /api/v1/auth/change-password`.
4. Save a result with `POST /api/v1/favorites/:identifier` and the user's token.
5. List favorites with `GET /api/v1/favorites`.
6. Run `npm run seed`, then log in as the administrator.
7. Demonstrate that the same password-change endpoint works for the administrator.
8. Create a draft with `POST /api/v1/admin/records`.
9. Publish it with `PATCH /api/v1/admin/records/:identifier`.
10. Confirm it appears through the public search endpoint.
11. Demonstrate validation by trying an unsupported sort field or oversized limit.

## API documentation

After starting the server:

- Swagger UI: `http://localhost:5000/api/v1/docs`
- Raw OpenAPI JSON: `http://localhost:5000/api/v1/docs.json`
- Postman: import `postman/Search_API.postman_collection.json`

## Tests

Run all automated tests:

```bash
npm test
```

Generate coverage:

```bash
npm run test:coverage
```

The automated suite verifies health and error responses, authentication, password changing, role authorization, public/admin route separation, favorite authentication, CRUD controller behavior, safe query construction, public visibility rules, sorting and validation boundaries. The Postman collection demonstrates the database-backed end-to-end flow.

## Deployment on Render

The repository includes `render.yaml`.

1. Push the project to GitHub. Do not push `.env`.
2. In Render, create a new Blueprint or Web Service from the repository.
3. Set `MONGO_URI` to your MongoDB Atlas connection string.
4. Let Render generate `JWT_SECRET`, or provide a strong random secret.
5. Set `CORS_ORIGIN` to the exact frontend domain; use comma-separated origins if needed.
6. Deploy and confirm `/health` and `/api/v1/docs` work.
7. Run the seed command once with production environment variables if sample/admin data is needed.

Before final capstone submission, replace the placeholders below with your real deployment addresses:

```text
Live API: https://search-api-pcbu.onrender.com
Swagger: https://search-api-pcbu.onrender.com/api/v1/docs
Health: https://search-api-pcbu.onrender.com/health
Frontend: https://search-api-frontend.onrender.com
```

For Atlas, allow connectivity from the hosting environment. Do not place database credentials in GitHub.

## Suggested team responsibilities

- Member 1: User authentication and JWT middleware.
- Member 2: Record model, indexes and administrator CRUD.
- Member 3: Public search, filters, sorting and pagination.
- Member 4: Favorites model, service and protected routes.
- Member 5: Validation, documentation, tests and deployment.

Use feature branches and pull requests, for example `feature/search-filters` and `feature/authentication`, so every member has meaningful commits and can explain their contribution.

## Capstone requirement mapping

| Requirement | Implementation |
| --- | --- |
| Complete backend API | Versioned REST endpoints and full admin-to-public flow |
| Database design | Separate User, Record and Favorite models with references and indexes |
| Authentication | Optional user registration/login for favorites; bcrypt, JWT and password changing |
| Authorization | Public search, protected personal favorites and admin-only CRUD |
| CRUD | Admin record create/read/update/delete |
| Business logic | Publishing visibility, unique slugs, weighted search and unique favorites |
| Validation | Zod body, path and query schemas |
| Error handling | Central middleware and non-leaking production errors |
| Consistent responses | `success`, `message`, `data`, optional `meta/errors` |
| Documentation | Swagger UI, OpenAPI JSON, Postman and README |
| Testing | Jest/Supertest suite plus Postman workflow |
| Security | Hashing, JWT, Helmet, CORS, rate limiting and request limits |
| Deployment | Render blueprint and health endpoint |

## Future improvements outside the MVP

- Cursor pagination for very large or fast-changing datasets.
- Typo-tolerant search through Elasticsearch, OpenSearch or Atlas Search.
- Saved searches and search analytics.
- Soft deletion and a formal audit log.
- Refresh tokens and password-reset workflow.

These are deliberately left outside the first MVP so the submitted backend remains focused, testable and explainable.
