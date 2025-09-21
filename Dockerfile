# Final Dockerfile using the .cjs custom server

# 1. Dependency Stage
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# 2. Builder Stage
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3. Final Runner Stage
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy package files to install production dependencies
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json* ./package-lock.json

# Install ONLY the production dependencies (like express)
RUN npm ci --omit=dev

# Copy the built application and the custom server
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# --- THE CHANGE IS HERE ---
# Copy the correctly renamed server.cjs file
COPY --from=builder /app/server.cjs ./server.cjs

EXPOSE 3000
ENV PORT 3000

# This command runs the "start" script, which now correctly points to server.cjs
CMD ["npm", "start"]