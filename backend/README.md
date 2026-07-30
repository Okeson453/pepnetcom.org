# PEPNETCOM Backend Engine

Modular monolith backend for PEPNETCOM — a multi-service platform.

## Stack
- **Runtime:** Bun 1.x / Node 22
- **HTTP:** Hono
- **API:** tRPC
- **ORM:** Prisma → PostgreSQL
- **Cache/Queue:** Redis (Valkey)
- **Jobs:** BullMQ
- **Auth:** JWT (Jose)

## Quick Start

```bash
# Install dependencies
bun install

# Copy environment
cp .env.example .env

# Start infrastructure
bun run docker:up

# Run migrations and seed
bun run db:migrate
bun run db:seed

# Start dev server
bun run dev
```

## API Endpoints
- tRPC: `POST /api/trpc/{module}.{procedure}`
- Health: `GET /api/health`
- Webhooks: `POST /api/webhooks/{paystack,flutterwave,stripe}`
- Signals Live: `GET /api/signals/live` (SSE)

## Modules
| Module | Endpoints | Roles |
|--------|-----------|-------|
| auth | register, login, logout, refresh, me | Public/Authed |
| users | list, getById, create, update, deactivate, roles | Admin |
| orders | list, getById, create, updateStatus, assignStaff, cancel | All |
| siwes | list, getById, assignWriter, uploadReport, updateDetails | Admin/Writer |
| academic | orders, subjects, assignments | All |
| strategies | list, getById, create, update, delete, purchase, myPurchases, salesReport | Public/Client/Admin |
| consultant | requests, applications, universities, countries | Public/Admin |
| marketing | projects, campaigns, reports, deliverables | Admin/Client |
| signals | list, getById, create, close, history, liveFeed, performanceStats, subscribers | Client/Admin |
| payments | initiate, verify, transactions, invoices, refunds, gateways, subscriptions | Client/Admin |
| cms | blog, categories, media, testimonials, faqs | Public/Admin |
| communication | messages, liveChat, emailBroadcast, notifications | Authed/Admin |
| tickets | list, getById, create, reply, updateStatus | All |
| analytics | website, sales, signals, reports | Admin |
| settings | general, company, security, email, sms, apiKeys, backup | Admin |

## Testing
```bash
bun run test
bun run test:coverage
```
