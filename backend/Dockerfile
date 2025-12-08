# ==============================================
# SAFRUN Backend - Production Dockerfile
# Multi-stage build for optimized container
# ==============================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for build)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Remove devDependencies
RUN npm prune --production

# Stage 2: Production
FROM node:20-alpine AS production

# Add labels
LABEL maintainer="SAFRUN Team"
LABEL description="SAFRUN Backend API Server"
LABEL version="1.0.0"

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

# Copy built assets from builder
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Create uploads directory
RUN mkdir -p uploads && chown nestjs:nodejs uploads

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Use dumb-init as PID 1
ENTRYPOINT ["dumb-init", "--"]

# Run database migrations and start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]

