# Etapa 1: Construcción (Usamos Maven con Java 21)
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app
# Copiamos el pom y el código fuente
COPY pom.xml .
COPY src ./src
# Compilamos y empaquetamos el .jar (saltando los tests para que sea rápido)
RUN mvn clean package -DskipTests

# Etapa 2: Ejecución (Solo el JRE limpio de Java 21)
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
# Jalamos el .jar ya compilado de la etapa anterior
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
# Arrancamos Spring Boot
ENTRYPOINT ["java", "-jar", "app.jar"]