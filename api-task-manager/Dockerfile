FROM node:20

WORKDIR /usr/src/app

ENV NODE_ENV dev

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD [ "node", "dist/main" ]