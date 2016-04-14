FROM ubuntu:14.04

# Declare constants
ENV NVM_VERSION v0.31.0
ENV NODE_VERSION v5.10.1

# Replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# Install pre-reqs
RUN apt-get update
RUN apt-get -y install curl build-essential git

# Install NVM
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/${NVM_VERSION}/install.sh | bash

# Install NODE
RUN source ~/.nvm/nvm.sh; \
    nvm install $NODE_VERSION; \
    nvm use --delete-prefix $NODE_VERSION;

# Bundle app source
COPY . /usr/src/app

WORKDIR "/usr/src/app"
RUN /root/.nvm/nvm-exec npm install
RUN /root/.nvm/nvm-exec npm build

EXPOSE 8080
#CMD [ "/root/.nvm/nvm-exec", "npm", "run", "serve" ]
