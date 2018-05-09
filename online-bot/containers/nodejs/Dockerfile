FROM node:7.9.0

WORKDIR /bot


COPY package.json /bot
COPY src/models /bot/src/models
COPY src/pages /bot/src/pages
COPY src/app.js /bot/src

RUN npm install --quiet || cat npm-debug.log

CMD ["npm", "run-script", "start"]
