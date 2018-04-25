FROM node:7.9.0

WORKDIR /bot


COPY package.json /bot
COPY models /bot/models
COPY app.js /bot

RUN npm install --quiet || cat npm-debug.log

CMD ["npm", "run-script", "start"]
