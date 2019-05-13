FROM keymetrics/pm2:latest-alpine

# Create app directory
WORKDIR /usr/src/app

# Bundle APP files
COPY src src/
COPY . .

# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn

RUN npm install
RUN npm run build:staging

# Expose 8099, Hedera Payment server listens on 8099 by default
EXPOSE 8099

CMD ["node", "dist/app.js", "--env","staging"]
