FROM node:latest

WORKDIR /app

COPY . .

RUN npm i
RUN npx prisma generate

CMD npx prisma migrate reset --force && npm run build && npm run start:prod