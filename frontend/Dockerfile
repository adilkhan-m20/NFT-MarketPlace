# ── Stage 1: Install dependencies ───────────────────────────────
FROM node:18-alpine AS deps

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

# ── Stage 2: Build ─────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app/frontend

COPY --from=deps /app/frontend/node_modules ./node_modules
COPY frontend/ .

ARG NEXT_PUBLIC_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
ENV NEXT_PUBLIC_CONTRACT_ADDRESS=$NEXT_PUBLIC_CONTRACT_ADDRESS

RUN echo "CONTRACT: $NEXT_PUBLIC_CONTRACT_ADDRESS"

RUN npm run build

# ── Stage 3: Production ───────────────────────────────────────
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy package.json
COPY frontend/package*.json ./
RUN npm ci 

# Copy built app
COPY --from=builder /app/frontend/.next ./.next

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["npm", "start"]