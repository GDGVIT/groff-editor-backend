FROM node:latest
# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
COPY package*.json ./
RUN npm install
RUN apt-get install groff
# Copy app source code
COPY . .
#Expose port and start application
CMD [ "npm", "start" ]
