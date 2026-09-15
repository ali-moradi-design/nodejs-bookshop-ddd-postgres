# Bounded contexts / modules

| Context | Domain | Application | HTTP (`/api/v1/...`) |
|---------|--------|-------------|----------------------|
| Auth | `domain/auth` | `application/auth` | `/auth` |
| Users | `domain/user` | `application/user` | `/users` |
| RBAC | `domain/rbac` (+ `hasPermission`) | `application/rbac` | `/roles`, `/permissions` |
| Books / stock | `domain/book` (+ stock rules) | `application/book` | `/books`, `/uploads` |
| Cart | `domain/cart` (+ totals rules) | `application/cart` (+ use-cases) | `/cart` |
| Orders | `domain/order` (+ transitions) | `application/order` (+ `pay-order`) | `/orders` |
| Discounts | `domain/discount` (+ calculate) | `application/discount` | `/discounts` |
| Favorites | `domain/favorite` | `application/favorite` | `/favorites` |
| Reviews | `domain/review` | `application/review` | `/reviews` |
| Reports | `domain/report` | `application/report` | `/reports` |
| Admin | — | `application/admin` | `/admin` |
| Shared domain | `domain/shared` (errors, VOs, events, storage/notification ports) | `application/shared` (UoW port) | middleware / docs |

Cross-cutting infrastructure: logging, local storage, console notifications, Prisma UoW (`$transaction`).
