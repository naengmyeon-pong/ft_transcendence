FROM node:18-alpine

RUN apk add --no-cache dumb-init

WORKDIR /app

COPY ./frontend /app
COPY ./types /app/types
COPY ./.env .

RUN npm run build

EXPOSE 3000

ENTRYPOINT [ "/usr/bin/dumb-init", "--" ]

CMD ["npm", "run", "start"]
