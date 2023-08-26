FROM node:18-alpine

RUN apk add --no-cache dumb-init

WORKDIR /app

COPY . .

EXPOSE 3001

ENTRYPOINT [ "/usr/bin/dumb-init", "--" ]

CMD ["npm", "run", "start"]
