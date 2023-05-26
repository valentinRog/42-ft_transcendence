FROM node:latest

WORKDIR /app

COPY . .

RUN npm install
RUN npx prisma generate

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT [ "/entrypoint.sh" ]