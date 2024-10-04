# Use Node.js base image directly
FROM node:20.11-alpine

# Create the directory for the application
RUN mkdir -p /home/node/app

# Set working directory
WORKDIR /home/node/app

# Copy package.json and yarn.lock first to leverage Docker cache
COPY package.json yarn.lock ./

# Install dependency packages using yarn
RUN yarn install

# Copy the rest of the application files
COPY . .

# Build code, resulting in dist
RUN yarn build

# Optional: Expose port
EXPOSE 9000

CMD [ "yarn", "start" ]
