# INES Lab Booking API

RESTful API for the INES Lab Booking System built with Node.js, Express, PostgreSQL (Knex), JWT authentication, and Zod validation.

## Tech Stack

- **Runtime:** Node.js (ES modules)
- **Framework:** Express 4
- **Database:** PostgreSQL via Knex.js
- **Auth:** JWT (access + refresh tokens) + bcrypt
- **Validation:** Zod
- **Logging:** Pino
- **Docs:** OpenAPI 3.0 + Swagger UI
- **Testing:** Jest + Supertest

## Prerequisites

- Node.js >= 18
- PostgreSQL >= 14

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file and adjust values
cp .env.example .env

# 3. Create the database
psql -U postgres -c "CREATE DATABASE ines_lab_booking;"

# 4. Run migrations
npm run migrate

# 5. Seed the database (idempotent — safe to re-run)
npm run seed

# 6. Start development server
npm run dev
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4000` | Server port |
| `NODE_ENV` | `development` | Environment |
| `DB_HOST` | `localhost` | Database host |
| `DB_PORT` | `5432` | Database port |
| `DB_NAME` | `ines_lab_booking` | Database name |
| `DB_USER` | `postgres` | Database user |
| `DB_PASSWORD` | `postgres` | Database password |
| `JWT_SECRET` | *(dev secret)* | JWT signing key |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token TTL |

## Running Tests

```bash
npm test
```

This runs 8 contract tests covering the API specification.

## Seed Users

| Email | Password | Role |
|-------|----------|------|
| `student@ines.ac.rw` | `password123` | student |
| `lecturer@ines.ac.rw` | `password123` | lecturer |
| `coordinator@ines.ac.rw` | `password123` | lab-coordinator |
| `alice@ines.ac.rw` | `password123` | student |
| `bob@ines.ac.rw` | `password123` | student |
| `diana@ines.ac.rw` | `password123` | lecturer |
| `eve@ines.ac.rw` | `password123` | lecturer |
| `frank@ines.ac.rw` | `password123` | lab-coordinator |

## API Endpoints

All endpoints are prefixed with `/api/v1`.

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| GET | `/health` | ✗ | — | Health check |
| POST | `/auth/login` | ✗ | — | Login (rate-limited: 5/min/IP) |
| POST | `/auth/refresh` | ✗ | — | Refresh access token |
| GET | `/auth/me` | ✓ | any | Get current user |
| GET | `/labs` | ✓ | any | List labs (paginated) |
| GET | `/labs/:id` | ✓ | any | Get lab details |
| GET | `/labs/:id/equipment` | ✓ | any | Get lab equipment |
| GET | `/bookings` | ✓ | coordinator | List all bookings (paginated) |
| GET | `/bookings/my` | ✓ | any | My bookings (paginated) |
| POST | `/bookings` | ✓ | any | Create booking |
| PATCH | `/bookings/:id/approve` | ✓ | coordinator | Approve/reject booking |

## API Response Envelope

Every response follows this format:

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "pagination": { "limit": 20, "offset": 0, "total": 42, "hasMore": true }
  }
}
```

## Pagination

List endpoints support `limit` and `offset` query parameters. Responses include:

- **`meta.pagination`** — limit, offset, total, hasMore
- **`Link` header** — RFC 5988 links (first, prev, next, last)
- **`X-Total-Count` header** — total result count

## Swagger UI

In development mode, Swagger UI is available at:

```
http://localhost:4000/docs
```

## Postman Collection

Import `postman/collection.json` into Postman to explore the API.

## Project Structure

```
src/
├── config/        # Configuration loader
├── db/            # Knex migrations & seeds
├── middleware/     # Auth, role, rate-limit, validation, error, logger
├── routes/        # Express route handlers
├── schemas/       # Zod validation schemas
├── utils/         # Response envelope, pagination, JWT helpers
└── app.js         # Express app setup
tests/             # Jest + Supertest contract tests
openapi.yaml       # OpenAPI 3.0 specification
```
