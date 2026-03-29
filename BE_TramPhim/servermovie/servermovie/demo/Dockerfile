# Bước 1: Build dự án bằng Maven (Sử dụng JDK 17, nếu bạn dùng Java 21 hãy đổi số 17 thành 21)
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app

# Copy file cấu hình Maven và mã nguồn vào container
COPY . .

# Thực hiện build file JAR (Bỏ qua chạy test để build nhanh hơn)
RUN mvn clean package -DskipTests

# Bước 2: Chạy ứng dụng bằng JDK nhẹ hơn (JRE)
FROM openjdk:17-jdk-slim
WORKDIR /app

# Copy file JAR đã build từ bước 1 sang bước này
COPY --from=build /app/target/*.jar app.jar

# Cổng mặc định của Spring Boot
EXPOSE 8080

# Lệnh khởi chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]