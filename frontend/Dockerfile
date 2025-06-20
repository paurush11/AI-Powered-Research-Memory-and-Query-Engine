# syntax=docker/dockerfile:1
FROM node:20 AS base
WORKDIR /app

# Copy dependency manifests first for efficient caching
COPY package*.json ./
# Install all dependencies (including optional) without peer-dependency legacy flag to avoid rollup native module issue
RUN npm install --silent --progress=false

# Copy the rest of the application source
COPY . ./
EXPOSE 5173
CMD ["sh", "-c", "npm install --silent && npm run dev -- --host 0.0.0.0"] 