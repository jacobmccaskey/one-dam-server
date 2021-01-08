#  Dockerfile for Node Express Backend api (development)

FROM node:10.16-alpine

# ARG NODE_ENV=development

# Create App Directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install Dependencies
COPY package*.json ./

RUN npm install && npm install -g nodemon && stripe listen --forward-to localhost:4545/stripe/paymentRecievedHook


# Copy app source code
COPY . .

# Exports
EXPOSE 4545
# change from dev to start in production build
CMD ["npm","start"]