FROM node:9.5-alpine
# vorgefertigtes Node image von hub.docker.com (Biblioteck/Registry)

ENV Port 8111
ENV DB_Type mySQL
ENV DB_Host localhost
ENV DB_Username root
ENV DB_Password root
ENV DB_Database SwaggerTest

USER node

COPY --chown=node:node . /home/node/app/
WORKDIR /home/node/app

RUN npm install
RUN ./node_modules/typescript/bin/tsc

WORKDIR /home/node/app/dist
CMD ["node", "main.js"]
