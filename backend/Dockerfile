FROM node:latest

WORKDIR /app

COPY . .

RUN npm install

CMD npx prisma migrate dev && npm run start