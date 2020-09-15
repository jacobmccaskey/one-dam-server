#  Dockerfile for Node Express Backend api (development)

FROM node:10.16-alpine

# ARG NODE_ENV=development

# Create App Directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install Dependencies
COPY package*.json ./

RUN npm ci && npm i -g nodemon

# Copy app source code
COPY . .

# Exports
EXPOSE 4545
# change from dev to start in production build
CMD ["npm","dev"]