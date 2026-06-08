# syntax=docker/dockerfile:1

# ---- 1. Build the frontend (Vite/React) ----
FROM oven/bun:1 AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/bun.lock* ./
RUN bun install --frozen-lockfile
COPY frontend/ ./
RUN bun run build

# ---- 2. Install backend production deps ----
FROM oven/bun:1 AS backend-deps
WORKDIR /app/backend
COPY backend/package.json backend/bun.lock* ./
RUN bun install --frozen-lockfile --production

# ---- 3. Runtime: Bun serves API + static frontend ----
FROM oven/bun:1-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    STATIC_DIR=/app/public \
    DATA_DIR=/app/data

# Backend source
COPY backend/src ./src
COPY backend/package.json ./package.json
# Backend deps and built frontend
COPY --from=backend-deps /app/backend/node_modules ./node_modules
COPY --from=frontend /app/frontend/dist ./public

RUN mkdir -p /app/data
EXPOSE 3000
CMD ["bun", "run", "src/index.ts"]
