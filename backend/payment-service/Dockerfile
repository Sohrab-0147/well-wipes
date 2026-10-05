FROM eclipse-temurin:21-jre
WORKDIR /app
COPY target/*.jar app.jar
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=60.0 -XX:+UseSerialGC -Xss512k -XX:MaxMetaspaceSize=128m"
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
