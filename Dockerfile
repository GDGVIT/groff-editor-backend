FROM node:12.18.4

WORKDIR /app

COPY package.json /app

COPY package-lock.json /app

RUN npm install

RUN apt update && apt upgrade -y && apt install -y groff

COPY . /app
RUN chmod +x /app/safe.sh


EXPOSE 3000

CMD [ "./safe.sh", "&&" ,"npm", "start" ]
