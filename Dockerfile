FROM node:22.12.0-slim

WORKDIR /app

# Install dependencies for root
COPY package*.json ./
RUN npm ci

# Install dependencies for client
COPY client/package*.json ./client/
RUN cd client && npm ci

# Copy the rest of the code
COPY . .

# Build the client
RUN cd client && npm run build

# Final command (adjust to your start script)
CMD ["npm", "start"]
