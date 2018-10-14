FROM node:8

EXPOSE 4040

ENV APP_PORT='4040'
ENV APP_NAME='INSIT => inkas:docker'
ENV PG_DB='inkas'
ENV PG_USER='inkas'
ENV PG_HOST='insit-db'
ENV PG_PASS='desg44'

RUN useradd -ms /bin/bash -d /usr/inkas inkas
USER inkas

WORKDIR /usr/inkas
RUN git clone https://github.com/aarusso-nyx/insit.git

WORKDIR /usr/inkas/insit
RUN npm install 

WORKDIR /usr/inkas/insit/web
RUN npm install 

WORKDIR /usr/inkas/insit

#CMD ["node", "start"]
ENTRYPOINT ['node', '.']