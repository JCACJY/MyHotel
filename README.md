# 华住酒店管理系统

MyHotel 是一个前后端分离的酒店管理系统示例项目。前端基于 React/Vite，后端基于 Java 17、Spring Boot 3.5、Spring MVC 和 MyBatis-Plus，默认使用 H2 内存数据库，生产环境可切换到 MySQL。

## 核心功能

- 首页客房展示
- 预定客房
- 订单查询
- 办理入住

## 环境要求

- JDK 17
- Node.js 20+
- Maven Wrapper：项目已包含 `mvnw`，无需单独安装 Maven

## Quick Start

在项目根目录执行：

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)

./mvnw test

cd src/main/webapp
npm install
npm run build
```

启动后端服务：

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
./mvnw spring-boot:run -Dspring-boot.run.arguments=--server.port=8081
```

另开一个终端启动前端开发服务：

```bash
cd src/main/webapp
npm run dev -- --host 127.0.0.1 --port 8080
```

浏览器访问：

```text
http://localhost:8080/
```

