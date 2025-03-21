# Use an official Node.js image from the Docker Hub
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Expose port 5000 to the host
EXPOSE 5000

# Command to run the application
CMD [ "npm", "start" ]
