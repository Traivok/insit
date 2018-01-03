FROM node:latest

WORKDIR /usr/inkas

COPY package*.json ./
COPY *.js ./ 
COPY ./webapps ./

RUN npm install 

EXPOSE 3001

CMD ["mkdir", "webapps" ]

CMD ["npm", "start"]

