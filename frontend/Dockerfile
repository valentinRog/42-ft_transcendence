FROM debian:bookworm

WORKDIR /app

COPY . .

RUN apt-get update &&\
    apt-get install -y nginx nodejs npm curl

RUN npm i -g n && n 20.3.1 &&\
    mv nginx.conf /etc/nginx/sites-enabled/default &&\
    npm i &&\
    chmod +x ./entrypoint.sh

ENTRYPOINT [ "./entrypoint.sh" ]

CMD ["nginx", "-g", "daemon off;"]