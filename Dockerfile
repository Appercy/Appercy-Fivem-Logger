FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Expose port
EXPOSE 4000

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["bun", "run", "src/index.ts"]
