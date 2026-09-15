# Bookstore API — single-stage Node image (PostgreSQL via DATABASE_URL)
FROM node:20-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci && npm cache clean --force

COPY tsconfig.json ./
COPY src ./src
# Build needs typescript; install temporarily
RUN npm install --no-save typescript tsc-alias && npm run build && npm prune --omit=dev

COPY .env.example ./.env.example

RUN mkdir -p uploads/books

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
