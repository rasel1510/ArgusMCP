FROM mcr.microsoft.com/playwright:v1.45.0-jammy

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies (without re-installing playwright browser binaries since the base image has them)
RUN npm install

# Copy source code and TypeScript config
COPY tsconfig.json ./
COPY src/ ./src/

# Compile TypeScript to JavaScript
RUN npm run build

# Configuration
ENV PORT=4000
ENV NODE_ENV=production
EXPOSE 4000

# Start production server
CMD ["node", "dist/server.js"]
