FROM node:24-alpine as build

LABEL authors="ardian"

WORKDIR /app
COPY package.json package.json

# Untuk bycrpt
RUN apk add --no-cache python3 make g++

RUN npm install


FROM build as production

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

COPY . .
COPY .env.example .env

EXPOSE ${PORT:-5001}

CMD ["npm", "run", "start-prod"]

FROM build as development

COPY . .
COPY .env.example .env

EXPOSE ${PORT:-5001}

CMD ["npm", "run", "start-dev"]