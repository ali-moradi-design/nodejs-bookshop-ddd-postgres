# Architecture

Pragmatic DDD-inspired layering for the Bookstore API.

## Layers

| Layer | Path | Responsibility |
|-------|------|----------------|
| **Domain** | `src/domain/` | Entities, repository ports, pure rules (stock, cart totals, discount calc, RBAC), value helpers (`Money`, `Email`, `Isbn`, `DiscountCode`), `DomainError`, lightweight in-process events |
| **Application** | `src/application/` | Services + focused use-cases (`add-to-cart`, `checkout-cart`, `pay-order`), DTOs/mappers, auth/password ports, unit-of-work port |
| **Infrastructure** | `src/infrastructure/` | Prisma/PostgreSQL repos, JWT/bcrypt, local-disk storage, console notifier, structured logger, composition root, Prisma `$transaction` UoW |
| **Interfaces** | `src/interfaces/http/` | Express HTTP: `v1/` routes/controllers/validators/presenters, middleware (security, request id, upload, errors), OpenAPI modules |
| **Shared** | `src/shared/` | `AppError`, Domain→HTTP mapping, asyncHandler, pagination |

**Rule:** Domain must not import infrastructure, interfaces, Express, Mongoose, or Prisma (enforced via ESLint).

## Request flow

```
HTTP (interfaces/http/v1)
  → controllers / presenters
  → application services / use-cases
  → domain rules + repository ports
  → infrastructure adapters (Prisma, storage, …)
```

`DomainError` is thrown from domain/application pure flows and mapped to HTTP `AppError` status codes in `errorHandler`.

## Composition

Wiring lives under `src/infrastructure/composition/`:

- `repos.ts` — Prisma repository instances
- `infra.ts` — tokens, hasher, storage, notifier, UoW, event stubs
- `services.ts` — application services
- `index.ts` — public barrel

## Module map

See [modules.md](./modules.md).

## Scripts & seed

Seed remains at `src/scripts/seed.ts` (`npm run seed`). Apply schema with `npx prisma migrate dev` (or `prisma db push` for local prototyping).

## Path aliases

TypeScript paths: `@domain/*`, `@application/*`, `@infrastructure/*`, `@interfaces/*`, `@shared/*`.  
Build rewrites via `tsc-alias`; Vitest resolves via `vitest.config.ts` aliases; `tsx` reads `tsconfig` paths.
