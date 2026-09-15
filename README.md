# Bookstore API (PostgreSQL)

Node.js + TypeScript + Express + **Prisma / PostgreSQL** backend with JWT auth, RBAC, books, reviews, orders (fake payments + stock), cart, favorites, discount codes, local image uploads, and admin dashboard.

> Migrated from the MongoDB/Mongoose edition. Business routes remain under **`/api/v1/...`**. Health: `/api/health`; Swagger: `/api/docs`.

## Architecture (DDD-inspired layers)

```
src/
  domain/              # Entities, ports, pure rules, VOs, DomainError, events
  application/         # Services, focused use-cases, DTOs, application ports
  infrastructure/      # Prisma, storage, logger, notifier, composition/
  interfaces/http/
    v1/                # Controllers, routes, validators, presenters
    middleware/        # Errors, upload, request id, security/
    docs/modules/      # Split OpenAPI path files
  shared/              # AppError, Domain→HTTP map, asyncHandler, pagination
  scripts/seed.ts
  app.ts
  server.ts
prisma/
  schema.prisma        # PostgreSQL data model
```

- **Domain** must not import Express, Prisma, infrastructure, or interfaces (ESLint boundary rules).
- Controllers call **application** services / use-cases; services depend on **domain repository ports**.
- Wiring: `infrastructure/composition/` (`repos`, `infra`, `services`).
- Details: [docs/architecture.md](docs/architecture.md) · [docs/modules.md](docs/modules.md)

## Stack

- Express 5, Prisma, PostgreSQL, Zod, Helmet, express-rate-limit, multer, cookie-parser
- bcryptjs, jsonwebtoken, dotenv, cors, morgan
- swagger-ui-express (OpenAPI at `/api/docs`)
- ESLint + Prettier, tsx for dev, tsc-alias for path aliases
- Vitest + supertest + **embedded-postgres** (or `TEST_DATABASE_URL`)

## Setup

```bash
cp .env.example .env
# Edit DATABASE_URL, e.g. postgresql://postgres:postgres@127.0.0.1:5432/bookstore?schema=public
npm install
npx prisma migrate dev   # or: npx prisma db push
npm run seed
npm run dev
```

Default admin (from seed):

- Email: `admin@bookstore.local`
- Password: `Admin123!`

Sample discount codes: `WELCOME10` (10% off, min $20), `FLAT5` ($5 off, min $15).

## Docker

The app container expects a reachable Postgres (`DATABASE_URL`). Example:

```bash
docker build -t nodejs-bookshop-postgres .
docker run --rm -p 4000:4000 --env-file .env nodejs-bookshop-postgres
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | tsx watch |
| `npm run build` | `prisma generate` + `tsc` + `tsc-alias` |
| `npm start` | run compiled server |
| `npm run lint` | ESLint (src + tests) |
| `npm run format` | Prettier |
| `npm run seed` | permissions, roles, admin, 40 imaged books, discounts |
| `npm run migrate` | `prisma migrate deploy` |
| `npm run migrate:dev` | `prisma migrate dev` |
| `npm test` | unit + integration (Vitest) |
| `npm run test:watch` | Vitest watch |

## Path aliases

`@domain/*`, `@application/*`, `@infrastructure/*`, `@interfaces/*`, `@shared/*` (tsconfig + Vitest + tsc-alias).

## Key routes

### Unversioned

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/health` | health |
| GET | `/api/docs` | Swagger UI |
| GET | `/api/docs.json` | OpenAPI JSON |

### Auth — `/api/v1/auth`

| Method | Path | Auth |
|--------|------|------|
| POST | `/register` | public |
| POST | `/login` | public |
| POST | `/refresh` | public (body **or** `refreshToken` cookie) |
| POST | `/logout` | public (body **or** `refreshToken` cookie) |

Register / login / refresh still return `accessToken` and `refreshToken` in JSON, and also set httpOnly cookies (`accessToken`, `refreshToken`). Protected routes accept `Authorization: Bearer <token>` first, otherwise the `accessToken` cookie.

### Cookie auth (Next.js / browsers)

CORS is `credentials: true`. Set `CORS_ORIGIN` to the frontend origin (e.g. `http://localhost:3000`). Do **not** use `*` in production — browsers reject `Access-Control-Allow-Origin: *` with credentials. If `CORS_ORIGIN=*` in development, the API reflects the request origin.

```ts
const API = 'http://localhost:4000';

await fetch(`${API}/api/v1/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ email, password }),
});

const me = await fetch(`${API}/api/v1/users/me`, { credentials: 'include' });

await fetch(`${API}/api/v1/auth/refresh`, {
  method: 'POST',
  credentials: 'include',
});

await fetch(`${API}/api/v1/auth/logout`, {
  method: 'POST',
  credentials: 'include',
});
```

Cookie flags: `httpOnly`, `path=/`, `secure` from `COOKIE_SECURE` (default true in production, false in development), `sameSite` from `COOKIE_SAME_SITE` (default `lax`). Optional `COOKIE_DOMAIN`. `sameSite=none` requires `COOKIE_SECURE=true` and HTTPS.


### Books — `/api/v1/books`

| Method | Path | Auth |
|--------|------|------|
| GET | `/` | public (search/filter) |
| GET | `/featured` | public |
| GET | `/:id` | public |
| POST / PATCH / DELETE | `/`, `/:id` | staff permissions |

### Cart — `/api/v1/cart`

| Method | Path | Auth |
|--------|------|------|
| GET | `/` | bearer or cookie |
| POST | `/items` | bearer or cookie |
| PATCH / DELETE | `/items/:bookId` | bearer or cookie |
| DELETE | `/` | clear |
| POST | `/checkout` | `orders:create` |

### Orders — `/api/v1/orders`

| Method | Path | Auth |
|--------|------|------|
| POST | `/` | `orders:create` |
| GET | `/` | own or all |
| GET | `/:id` | own or all |
| POST | `/:id/pay` | owner / staff |
| PATCH | `/:id/status` | `orders:update-status` |

Also: favorites, discounts, reviews, users, roles, permissions, reports, uploads, admin dashboard — see Swagger.

## Seed & cover images

`npm run seed` upserts permissions, roles, admin, **40 books** with Open Library covers, featured flags, and sample discounts (idempotent by ISBN).

## Book search

`GET /api/v1/books` supports `q`, `category`, `minPrice`/`maxPrice`, `inStock`, `featured`, `sort`, `order`, `page`/`limit`. Dedicated: `GET /api/v1/books/featured`. Case-insensitive `ILIKE` on title/author/description.

## Tests & CI

- Unit: `tests/unit/` (domain rules + key use-cases; no DB)
- Integration: `tests/integration/` (supertest)
  - Default: boots **embedded-postgres** and runs `prisma db push`
  - Or set `TEST_DATABASE_URL` to a disposable Postgres database
- GitHub Actions: `.github/workflows/ci.yml` (Postgres service + lint, build, test)

## What changed vs Mongo version

- Persistence: Mongoose models/repos → Prisma schema + Prisma repositories
- Env: `MONGODB_URI` → `DATABASE_URL`
- Transactions: Mongo sessions → Prisma `$transaction` (AsyncLocalStorage client)
- IDs: ObjectId → `cuid()` strings
- Tests: MongoMemoryServer → embedded-postgres / `TEST_DATABASE_URL`

## License

MIT
