FROM node:15 AS ui-build
WORKDIR /usr/src/app
COPY client/ ./client/
RUN cd client && npm install && npm run build

FROM node:15 AS server-build
WORKDIR /root/
COPY --from=ui-build /usr/src/app/client/build ./client/build
COPY backend/ ./backend/
RUN cd backend && npm install

EXPOSE 3080

CMD ["node", "./backend/index.js"]