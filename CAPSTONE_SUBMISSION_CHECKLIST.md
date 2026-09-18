# TS Academy Capstone Submission Checklist

This project implements Topic 25: Search API - search records with filters, sorting and pagination.

## Included and verified

- [x] Node.js and Express REST API
- [x] MongoDB models for users, records and favorites
- [x] Registration and login
- [x] Password hashing
- [x] Password changing for users and administrators
- [x] JWT generation and validation
- [x] Old-token invalidation after a password change
- [x] User/admin role authorization
- [x] Administrator record CRUD
- [x] Public full-text search
- [x] Filters, allow-listed sorting and pagination
- [x] Zod request validation
- [x] Centralized error handling and consistent responses
- [x] Helmet, CORS, rate limiting and request-size limits
- [x] Swagger/OpenAPI documentation
- [x] Executable Postman end-to-end workflow
- [x] Jest/Supertest automated tests
- [x] Clean `npm ci` installation
- [x] Render deployment blueprint
- [x] `.env.example` without real secrets
- [x] `.gitignore` excludes `.env` and `node_modules`
- [x] Push the project to the team's GitHub repository.

## Complete before final submission


- [ ] Use feature branches and pull requests instead of having everyone work directly on `main`.
- [ ] Confirm each member has meaningful commits and can explain their contribution.
- [ ] Configure MongoDB Atlas and the required Render environment variables.
- [ ] Deploy the API to Render or another approved platform.
- [ ] Run `npm run seed` once with production environment variables.
- [ ] Replace the deployment placeholders in `README.md` with the real live API, Swagger and health URLs.
- [ ] Run the Postman collection against the deployed URL and retain evidence of the successful workflow.
- [ ] Demonstrate project structure, database models, authentication, authorization, search, validation, errors, documentation, tests and deployment.

## Final local verification

```bash
npm ci
npm test
npm audit --omit=dev
npm run seed
npm start
```

Then open:

```text
http://localhost:5000/health
http://localhost:5000/api/v1/docs
```
