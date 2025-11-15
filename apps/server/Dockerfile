# ============================================================================
# DOCKERFILE - Firma Hukum PERARI Backend
# Optimized for Development with pnpm + Docker Layer Caching
# ============================================================================

FROM node:20-alpine

# Set npm registry mirror (npmmirror.com jauh lebih stabil di Asia)
RUN npm config set registry https://registry.npmmirror.com/ \
    && corepack enable \
    && corepack prepare pnpm@9.12.2 --activate

WORKDIR /app

# Install system dependencies for Prisma & health checks
RUN apk add --no-cache openssl wget bash

# ============================================================================
# LAYER 1: Dependencies (paling jarang berubah = cache layer terbaik)
# ============================================================================
COPY package.json pnpm-lock.yaml ./

# Install ALL dependencies
RUN pnpm install --frozen-lockfile

# ============================================================================
# LAYER 2: Prisma (berubah kalau schema berubah)
# ============================================================================
COPY prisma ./prisma/

# Generate Prisma Client
RUN pnpm prisma generate

# ============================================================================
# LAYER 3: Source code (paling sering berubah)
# ============================================================================
# Copy source files
COPY src ./src/

# Copy config files
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY .prettierrc ./

# ============================================================================
# LAYER 4: Runtime setup
# ============================================================================
# Create necessary directories with proper structure
RUN mkdir -p \
    uploads/dokumen \
    uploads/avatars \
    uploads/documents \
    uploads/temp \
    logs \
    backups/redis

# Set ownership to node user (security best practice)
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Expose application port
EXPOSE 3000

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

# Start application in development mode with hot reload
CMD ["pnpm", "run", "start:dev"]