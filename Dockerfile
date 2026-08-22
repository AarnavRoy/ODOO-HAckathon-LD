# Use an image with both Java and Node.js
FROM openjdk:17-node

WORKDIR /app

# Copy your code
COPY . .

# Install dependencies and build React (adjust paths if your folders are named differently)
RUN cd frontend && npm install && npm run build

# Build Spring Boot JAR (ensure you have Maven/Gradle wrapper)
RUN chmod +x mvnw && ./mvnw clean package -DskipTests

# Make your script executable
RUN chmod +x start.sh

# Expose the port your app runs on (usually 8080 or 3000)
EXPOSE 8080

# Run your script
CMD ["./start.sh"]   
