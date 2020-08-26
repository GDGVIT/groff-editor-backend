FROM node:9
# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
COPY package*.json ./
RUN npm install
# Copy app source code
RUN apt update && apt upgrade -y && apt install -y groff
COPY . .
#Expose port and start application
EXPOSE 8080
CMD [ "npm", "start" ]
