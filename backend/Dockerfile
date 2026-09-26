# Production Dockerfile for ISML NestJS Backend Service
FROM node:20-slim AS builder

RUN apt-get update -y && apt-get install -y openssl ca-certificates

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Copy source code and build
COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-slim AS runner

RUN apt-get update -y && apt-get install -y openssl ca-certificates

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 4000

CMD ["node", "dist/main"]

