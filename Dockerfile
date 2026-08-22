# Use official Node image
FROM node:18-slim

WORKDIR /app

# Install Java (OpenJDK 17) and Maven
RUN apt-get update && apt-get install -y openjdk-17-jdk maven && rm -rf /var/lib/apt/lists/*

# Set Java Home
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

# Copy and build frontend
COPY . .
RUN cd frontend && npm install && npm run build

# Build backend
RUN cd backend && mvn clean package -DskipTests

# Make script executable
RUN chmod +x start.sh

EXPOSE 8080
CMD ["./start.sh"]   
