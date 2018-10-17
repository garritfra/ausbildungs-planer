FROM node:10

WORKDIR /usr/src/app
COPY . .

COPY package*.json ./

RUN npm install
RUN npm run build

RUN npm install -g serve
CMD serve -s dist -p 8080

EXPOSE 8080