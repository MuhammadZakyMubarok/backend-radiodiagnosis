FROM node:24-alpine AS base
WORKDIR /app

# Untuk bycrpt
RUN apk add --no-cache python3 make g++

COPY package*.json ./

# untuk dependecies development
FROM base AS dev-deps
RUN npm install

# untuk dependecies production
FROM base AS prod-deps
RUN npm ci --only=production

# Development
FROM node:24-alpine AS development
WORKDIR /app

# Copy node_modules
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .

COPY .env.example .env

ENV NODE_ENV=development
EXPOSE ${PORT:-5001}

CMD ["npm", "run", "start-dev"]

# Production
FROM node:24-alpine AS production
WORKDIR /app

# Copy node_modules
COPY --from=prod-deps /app/node_modules ./node_modules
COPY . .
COPY .env.production .env

ENV NODE_ENV=production
EXPOSE ${PORT:-5001}

CMD ["npm", "run", "start-prod"]
