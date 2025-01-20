# Use an official Node.js image as the base image
FROM node:18-alpine AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN npm run build

# Use a lightweight Node.js image to reduce the final size
FROM node:18-alpine AS release

# Set the working directory in the release image
WORKDIR /app

# Copy the build output and node_modules from the builder stage
COPY --from=builder /app/build /app/build
COPY --from=builder /app/node_modules /app/node_modules

# Set environment variables required by the application
ENV NODE_ENV=production
ENV SYSTEMPROMPT_API_KEY=your_systemprompt_api_key
ENV NOTION_API_KEY=your_notion_integration_token

# Set the command to run the application
ENTRYPOINT ["node", "build/index.js"]