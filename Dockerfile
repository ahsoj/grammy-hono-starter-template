# ---- Base Image ----
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build the project
RUN pnpm build

# ---- Production Image ----
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Copy only necessary files
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY package.json ./

# Optional: install only production deps
# RUN npm install --omit=dev

# Expose port (match your .env PORT if needed)
EXPOSE 8080

# Set environment to production
ENV NODE_ENV=production

# Start the bot
CMD ["pnpm", "start"]
