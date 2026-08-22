# CHANGE THIS LINE: Use node:20 or node:22
FROM node:22-slim

WORKDIR /app

# Install Java (OpenJDK 17) and Maven
RUN apt-get update && apt-get install -y openjdk-17-jdk maven && rm -rf /var/lib/apt/lists/*
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64

COPY . .

# Now this will work because Node version is >= 20
RUN npm install && npm run build

RUN mvn clean package -DskipTests

RUN chmod +x start.sh
EXPOSE 8080
CMD ["./start.sh"]   
