FROM node:9.5-alpine
# vorgefertigtes Node image von hub.docker.com (Biblioteck/Registry)

ENV Port 8111
ENV DB_Type mySQL
ENV DB_Host localhost
ENV DB_Port 3306
ENV DB_Username root
ENV DB_Password root
ENV DB_Database SwaggerTest

# alpine
RUN apk update && apk add python postgresql-dev make g++
RUN npm config set unsafe-perm=true
RUN npm install -g pg-native

# non alpine
# RUN apt-get update && apt-get install libpq-dev g++ make
# RUN npm config set unsafe-perm=true
# RUN npm install -g pg-native

COPY . /home/node/app/
RUN chown node:node /home/node/app/
USER node
WORKDIR /home/node/app

RUN npm install
RUN ./node_modules/typescript/bin/tsc

USER root
# alpine
RUN apk del g++ make
# non alpine
# RUN apt-get -y remove g++ make

USER node
WORKDIR /home/node/app
CMD ["node", "dist/main.js"]
