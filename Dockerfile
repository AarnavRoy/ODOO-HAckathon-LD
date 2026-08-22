# Use Node 22 (includes npm)
FROM node:22-slim

WORKDIR /app

# Install Java (OpenJDK 17) and Maven
RUN apt-get update && apt-get install -y openjdk-17-jdk maven && rm -rf /var/lib/apt/lists/*
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# Copy all files
COPY . .

# 1. Build React Frontend
RUN npm install && npm run build

# 2. Build Spring Boot Backend
RUN mvn clean package -DskipTests

# 3. CRITICAL: Copy React build (dist) to Spring Boot static resources
# This allows Spring Boot to serve the frontend when you run the JAR
RUN mkdir -p target/classes/static && cp -r dist/* target/classes/static/

# 4. Make script executable
RUN chmod +x start.sh

EXPOSE 8080

# 5. Run the script (which now only runs the JAR)
CMD ["./start.sh"]   
