FROM node:18-alpine

# Working directory
WORKDIR /frontend

COPY . /frontend

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]