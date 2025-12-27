# Stage 1: Build the Frontend Client
FROM node:20 as client-build
WORKDIR /app/client
COPY package*.json ./
RUN npm install
COPY . .
# Build the React app (output goes to /app/client/dist)
RUN npm run build

# Stage 2: Build the Backend Server
FROM node:20 as server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ .
# Compile TypeScript to JavaScript (output goes to /app/server/dist)
# Ensure typescript is available
RUN npm install -g typescript
RUN tsc

# Stage 3: Production Runtime
FROM node:20-alpine
WORKDIR /app

# Copy Backend Production Artifacts
COPY --from=server-build /app/server/dist ./dist
COPY --from=server-build /app/server/package*.json ./
# Install ONLY production dependencies for backend
RUN npm install --production

# Copy Frontend Build Artifacts to a 'public' directory served by backend
COPY --from=client-build /app/client/dist ./public

# Expose the server port
EXPOSE 5000

# Start the server
CMD ["node", "dist/index.js"]
