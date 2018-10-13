FROM node:8

EXPOSE 4040

ENV PG_CONNECTION_STRING='postgres://inkas@localhost/inkas'
ENV GIT_SSH=/usr/inkas/git-ssh.sh
ENV GIT_SSH_KEY=/usr/inkas/aws-git.key

RUN useradd -ms /bin/bash -d /usr/inkas inkas
USER inkas
WORKDIR /usr/inkas

#RUN mkdir /usr/inkas/.ssh 
#RUN chmod 700 /usr/inkas/.ssh 
ADD ./git-ssh.sh /usr/inkas/
ADD ./aws-git.key /usr/inkas/


RUN git clone ssh://git-codecommit.us-west-2.amazonaws.com/v1/repos/insit
RUN npm install 

CMD ["npm", "start"]
