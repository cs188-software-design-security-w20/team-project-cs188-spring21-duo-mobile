# Specify base image
FROM node:latest

# Specify working directory
WORKDIR /usr/hopscotch

# ENV GOOGLE_APPLICATION_CREDENTIALS="/usr/hopscotch/google-credentials.json"

# Copy package.json over first to optimize cache usage
COPY ./package.json ./

# Install dependencies
RUN yarn install

# Copy remaining files
COPY ./ ./

# Default command
CMD ["yarn","start"]