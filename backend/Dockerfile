FROM node:latest

WORKDIR /app

COPY . .

RUN npm install
RUN npx prisma generate

CMD npx prisma migrate deploy && npm run start