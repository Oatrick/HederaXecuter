FROM node:10

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm install

# Set Timezone to Asia/Yangon
ENV TZ Asia/Yangon
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

COPY . .

# Expose 8099, Hedera Payment server listens on 8099 by default
EXPOSE 8099

# Run dev env 
CMD [ "npm", "run", "dev" ]
