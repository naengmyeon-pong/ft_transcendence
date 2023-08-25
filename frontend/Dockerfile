FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json .

# RUN npm install
RUN npm run build

COPY my.conf /etc/nginx/http.d

FROM nginx:stable-alpine3.17

COPY --from=builder /app/build /usr/share/nginx/html
