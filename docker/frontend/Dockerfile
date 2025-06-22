FROM node:16

RUN npm install -g expo-cli && \
    expo doctor --fix-dependencies

WORKDIR /app

COPY ../../package*.json .
RUN npm install

COPY ../.. .

EXPOSE 19000 19001 19002
CMD ["expo", "start"]