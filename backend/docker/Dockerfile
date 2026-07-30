# syntax=docker/dockerfile:1

# ---- deps: install dependencies in isolation so this layer caches independently of source changes ----
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lock* ./
# NOTE: no bun.lock was present in the original archive. Commit one
# (`bun install` locally, then `git add bun.lock`) and switch this to
# `bun install --frozen-lockfile` before this ever builds a production
# image — unpinned installs mean two builds of the same commit can resolve
# different transitive dependency versions.
RUN if [ -f bun.lock ]; then bun install --frozen-lockfile; else bun install; fi

# ---- build: generate the Prisma client against the full source tree ----
FROM oven/bun:1 AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json bun.lock* ./
COPY prisma ./prisma
COPY . .
# Strip dev-only dependencies (vitest, eslint, typescript, prettier, supertest)
# out of what ships to runtime.
RUN bun install --production
# Generate AFTER the prune, not before: this project has no `postinstall`
# script, so `bun install --production` can reinstall @prisma/client fresh
# from the registry and silently wipe out an earlier `prisma generate` run,
# leaving runtime with the un-generated client stub. Always generate last.
RUN bunx prisma generate

# ---- runtime: minimal, non-root, with only what's needed to run the app ----
FROM oven/bun:1-slim AS runtime
WORKDIR /app

# postgresql-client provides pg_dump, used by settings.service.ts::triggerBackup.
# The prior image had no pg_dump at all, so that endpoint 500'd with ENOENT on
# every deployed environment (§9.4 of the audit) even though it worked for a
# developer running it against a host-installed pg_dump outside the container.
# Pin to postgres 16 client tools to match the postgres:16-alpine service in
# docker-compose.yml — a mismatched major version can fail pg_dump against a
# newer/older server.
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl gnupg lsb-release ca-certificates \
  && install -d /usr/share/postgresql-common/pgdg \
  && curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc \
  && echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
  && apt-get update \
  && apt-get install -y --no-install-recommends postgresql-client-16 \
  && apt-get purge -y --auto-remove curl gnupg lsb-release \
  && rm -rf /var/lib/apt/lists/*

RUN addgroup --system app && adduser --system --ingroup app app

COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/package.json ./package.json
COPY --from=build --chown=app:app /app/prisma ./prisma
COPY --from=build --chown=app:app /app/src ./src
COPY --from=build --chown=app:app /app/node_modules/.bin ./node_modules/.bin

USER app
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["bun", "run", "src/server.ts"]
