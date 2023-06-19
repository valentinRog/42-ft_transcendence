FROM debian:latest

WORKDIR /app

COPY . .

RUN apt-get update && apt-get install -y nginx nodejs npm curl

RUN npm i -g n && n latest

COPY nginx.conf /etc/nginx/sites-enabled/default

RUN npm i

EXPOSE 80

RUN chmod +x ./entrypoint.sh

ENTRYPOINT [ "./entrypoint.sh" ]

CMD ["nginx", "-g", "daemon off;"]