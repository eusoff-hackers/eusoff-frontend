FROM node:20

WORKDIR /usr/src/
COPY package.json ./
COPY package-lock.json ./
COPY .env ./.env.local
RUN npm ci

COPY . .

EXPOSE 3000

RUN npm run build

CMD npm run start
