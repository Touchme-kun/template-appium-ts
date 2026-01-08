# Multi-stage Dockerfile for Mobile Automation Framework
# Stage 1: Base image with dependencies
FROM node:18-slim AS base

# Install system dependencies (only what's needed for Node.js/TypeScript Appium)
RUN apt-get update && apt-get install -y \
    curl \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Stage 2: Build stage
FROM base AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY src ./src
COPY tests ./tests
COPY configs ./configs
COPY scripts ./scripts

# Build TypeScript
RUN npm run build

# Stage 3: Production image
FROM base AS production

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/configs ./configs

# Copy test files (needed for execution)
COPY tests ./tests
COPY scripts ./scripts

# Create directories for reports and logs
RUN mkdir -p reports logs allure-results allure-report

# Set environment variables
ENV NODE_ENV=production
ENV PATH="/app/node_modules/.bin:${PATH}"

# Default command
CMD ["npm", "run", "test"]

# Stage 4: Development image with all dependencies
FROM base AS development

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies including dev dependencies
RUN npm install --legacy-peer-deps

# Copy all source code
COPY . .

# Create necessary directories
RUN mkdir -p reports logs allure-results allure-report apps

# Set environment variables
ENV NODE_ENV=development
ENV PATH="/app/node_modules/.bin:${PATH}"

# Expose Appium port (if running Appium inside this container)
EXPOSE 4723

# Default command for development
CMD ["npm", "run", "test"]
