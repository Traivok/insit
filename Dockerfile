FROM node:8

EXPOSE 4040

ENV PG_CONNECTION_STRING='postgres://inkas@localhost/inkas'

RUN useradd -ms /bin/bash -d /usr/inkas inkas
USER inkas

WORKDIR /usr/inkas
RUN git clone https://github.com/aarusso-nyx/insit.git

WORKDIR /usr/inkas/insit
RUN npm install 

WORKDIR /usr/inkas/insit/web
RUN npm install 

WORKDIR /usr/inkas/insit

CMD ["npm", "start"]