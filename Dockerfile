# Final Corrected Dockerfile for Custom Server

# 1. Dependency Stage
# Install all dependencies to a base image
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# 2. Builder Stage
# Build the application
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3. Final Runner Stage
# Create the final, small production image
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy package files needed to install production dependencies
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json* ./package-lock.json

# --- THE FIX IS HERE ---
# Install ONLY the production dependencies (like express)
RUN npm ci --omit=dev

# Copy the built application and the custom server
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.js ./server.js

EXPOSE 3000
ENV PORT 3000

# Use the start script from package.json to run the server
CMD ["npm", "start"]