# syntax=docker/dockerfile:1
# ---------- Build stage ----------
FROM maven:3.9-eclipse-temurin-22 AS build
WORKDIR /app
# Cache dependencies first
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src ./src
RUN mvn -q -B -DskipTests package && cp target/*.jar app.jar

# ---------- Runtime stage ----------
FROM eclipse-temurin:22-jre
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/* \
    && useradd --system --uid 1001 talentbridge && mkdir -p /app/uploads && chown -R talentbridge /app
COPY --from=build /app/app.jar app.jar
USER talentbridge
ENV APP_STORAGE_DIR=/app/uploads \
    JAVA_OPTS="-XX:MaxRAMPercentage=75 -Dfile.encoding=UTF-8"
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=5s --start-period=90s --retries=10 \
  CMD curl -fsS "http://localhost:8080/api/v1/jobs?page=0&size=1" >/dev/null || exit 1
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
