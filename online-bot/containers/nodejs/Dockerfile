FROM node:7.9.0

WORKDIR /bot

COPY package.json /bot
COPY . /bot

# RUN npm install --quiet || cat npm-debug.log
RUN npm install

CMD ["npm", "run-script", "start"]
