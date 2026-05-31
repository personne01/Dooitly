# Stage 1: Build the React frontend and compile the TypeScript backend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production environment
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./

# Install only production dependencies (no devDependencies) to keep it lightweight
RUN npm install --omit=dev

# Copy the compiled production assets (backend server and build folder) from builder
COPY --from=builder /app/dist ./dist

# Hugging Face Spaces requires the app to listen on port 7860
EXPOSE 7860
ENV PORT=7860
ENV NODE_ENV=production

# Start the built backend server
CMD ["node", "dist/server.cjs"]
