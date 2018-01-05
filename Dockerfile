FROM node:latest

EXPOSE 3001

ENV PG_CONNECTION_STRING='postgres://inkas@thiamat.nyxk.com.br/inkas'

RUN useradd -ms /bin/bash -d /usr/inkas inkas
USER inkas
WORKDIR /usr/inkas

ADD . /usr/inkas

RUN npm install 

CMD ["npm", "start"]