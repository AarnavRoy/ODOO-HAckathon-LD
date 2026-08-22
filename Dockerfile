# Use Node image and install Java
FROM node:18-slim

WORKDIR /app

# Install Java (OpenJDK 17) and Maven
RUN apt-get update && apt-get install -y openjdk-17-jdk maven && rm -rf /var/lib/apt/lists/*
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# Copy all files from root
COPY . .

# 1. Build React (Runs in root where package.json is)
RUN npm install && npm run build

# 2. Build Spring Boot (Runs in root where pom.xml is)
RUN mvn clean package -DskipTests

# 3. Make your script executable
RUN chmod +x start.sh

# 4. Expose port
EXPOSE 8080

# 5. Run your script
CMD ["./start.sh"]   
