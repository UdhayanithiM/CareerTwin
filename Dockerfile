# Final Dockerfile using the official Next.js multi-stage pattern

# 1. Dependency Stage
# Install dependencies to a base image
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# 2. Builder Stage
# Build the application
FROM node:20-slim AS builder
WORKDIR /app
# Copy dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3. Final Runner Stage
# Create the final, small production image
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy the built application from the 'builder' stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/server.js ./server.js

# Expose the port and start the custom server
EXPOSE 3000
ENV PORT 3000
CMD ["npm", "start"]