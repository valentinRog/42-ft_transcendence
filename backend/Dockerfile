FROM node:20

WORKDIR /app

COPY . .

RUN npm i

RUN chmod +x ./entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]

CMD npm run start:prod