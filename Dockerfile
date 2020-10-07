FROM node:12.18.4

WORKDIR /app

COPY package.json /app

COPY package-lock.json /app

RUN npm install

RUN apt update && apt upgrade -y && apt install -y groff

COPY . /app

EXPOSE 3000

CMD [ "npm", "start" ]
