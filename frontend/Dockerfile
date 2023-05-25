FROM node:latest

WORKDIR /app

COPY . .

RUN npm i

RUN npm run build

CMD npm run dev -- --host 0.0.0.0