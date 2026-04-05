# ── Stage 1: Build (optional but clean) ─────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy project files
COPY . .

# ── Stage 2: Runtime ───────────────────────────────────────
FROM node:18-alpine

WORKDIR /app

# Install only production deps (optional for hardhat, can keep dev too)
COPY package*.json ./
RUN npm ci

# Copy full project
COPY --from=builder /app ./

# Default command (for debugging container)
CMD ["npx", "hardhat", "--version"]