FROM node:18-alpine

RUN apk add --no-cache dumb-init

WORKDIR /app

COPY ./backend .
COPY ./types ./types
COPY ./.env ./.env

RUN npm ci
RUN npm run build

EXPOSE 3001

ENTRYPOINT [ "/usr/bin/dumb-init", "--" ]

CMD ["npm", "run", "start"]
