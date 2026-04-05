# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first (better Docker layer caching)
COPY package*.json ./

# Install all dependencies including devDependencies (needed for Hardhat)
RUN npm ci

# Copy rest of backend source
COPY . .

# Compile Solidity contracts
RUN npx hardhat compile

# ── Stage 2: Production ─────────────────────────────────────────
FROM node:18-alpine AS runner

WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled artifacts and source from builder
COPY --from=builder /app/artifacts ./artifacts
COPY --from=builder /app/contracts ./contracts
COPY --from=builder /app/scripts ./scripts

# If you have an Express/API server, copy that too
# COPY --from=builder /app/server ./server

# Expose port (change if your backend uses a different port)
EXPOSE 3001

# Default command — change to your actual server start command
# e.g. CMD ["node", "server/index.js"]
CMD ["node", "--version"]