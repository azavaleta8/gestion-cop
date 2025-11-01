# Development Dockerfile for hot reload
FROM node:18-alpine

# Install dependencies for development
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Expose the port
EXPOSE 3000

# Set environment
ENV NODE_ENV=development
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the development server 
CMD ["npm", "run", "dev"]