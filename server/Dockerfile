# Stage 1: Build the image (using a smaller, production-ready base)
FROM node:22-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files first to leverage caching
# Railway will handle running npm install based on the package.json
COPY . /app

# Run install dependencies (This is the critical step for Railway)
RUN npm install --only=production

# Copy all application files
# Exclude files listed in .dockerignore
COPY . .

# Expose the port used by the Express server
EXPOSE 5001

# Command to run the application
# This uses your 'start' script defined in server/package.json
CMD ["npm", "start"]