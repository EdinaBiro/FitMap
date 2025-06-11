FROM node:16

RUN npm install -g expo-cli && \
    expo doctor --fix-dependencies

WORKDIR /app

# Copy package files first
COPY ../../package*.json .
RUN npm install

# Copy the rest of the frontend
COPY ../.. .

EXPOSE 19000 19001 19002
CMD ["expo", "start"]