FROM node:latest

WORKDIR /app

COPY . .

RUN npm i
RUN npx prisma generate

CMD npx prisma migrate deploy && npm run build && npm run start:prod