FROM node:18
WORKDIR /usr/src/app/
COPY package.json package-lock.json* ./
COPY package*.json ./
RUN npm ci --production && npm cache clean --force
RUN echo '1.0.0' > version-info
COPY . .
ENTRYPOINT [ "node", "./dist/index.js" ]
#ENTRYPOINT ["sleep", "infinity"]
