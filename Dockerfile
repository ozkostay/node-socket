FROM node:15.8-alpine
WORKDIR /app
ARG NODE_ENV=production
COPY package*.json ./
RUN npm install
COPY index.js ./
COPY css/ ./css/
COPY middleware/ ./middleware/
COPY public/ ./public/
COPY routers/ ./routers/
COPY store/ ./store/
COPY views/ ./views/
CMD ["npm", "run", "start"]