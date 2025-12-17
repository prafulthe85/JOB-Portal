# backend/Dockerfile

# Stage 1: build (optional for transpilation). For plain Node apps we can do single stage.
FROM node:18-alpine

# Create app dir
WORKDIR /app

# Install dependencies
# Copy package files first for better caching
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Expose port (match your express port)
EXPOSE 4000

# Command to run
CMD ["npm", "start"]
