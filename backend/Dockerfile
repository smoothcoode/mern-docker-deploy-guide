# Base image with deps
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production


# Final image
FROM node:20-alpine AS final 
WORKDIR /app
# Create non-root user
RUN addgroup -S app && adduser -S app -G app
# Copy deps + source
COPY --from=build /app/node_modules ./node_modules
COPY . .
USER app
EXPOSE 5000
CMD ["node", "server.js"]
