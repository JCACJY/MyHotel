# syntax=docker/dockerfile:1

FROM node:20-alpine AS frontend-build
WORKDIR /workspace/src/main/webapp

COPY src/main/webapp/package*.json ./
COPY src/main/webapp/bun.lock* ./
RUN npm install

COPY src/main/webapp/ ./
RUN npm run build

FROM maven:3.9-eclipse-temurin-17 AS backend-build
WORKDIR /workspace

COPY pom.xml mvnw mvnw.cmd ./
COPY .mvn/ .mvn/
RUN chmod +x ./mvnw && ./mvnw -q -DskipTests dependency:go-offline

COPY src/main/java/ src/main/java/
COPY src/main/resources/ src/main/resources/
RUN ./mvnw -DskipTests package

FROM node:20-bookworm-slim
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openjdk-17-jre-headless ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV BACKEND_PORT=8081
ENV FRONTEND_PORT=8080
ENV BACKEND_URL=http://127.0.0.1:8081
ENV JAVA_OPTS=""

COPY --from=backend-build /workspace/target/*.jar /app/myhotel.jar
COPY --from=frontend-build /workspace/src/main/webapp/dist/ /app/frontend/dist/
COPY docker/frontend-server.mjs /app/frontend/server.mjs
COPY docker/entrypoint.sh /app/entrypoint.sh

RUN chmod +x /app/entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/app/entrypoint.sh"]
