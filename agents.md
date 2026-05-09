# MyHotel — Agent Instructions

## Project Overview

MyHotel is a hotel management system with a React frontend and a Spring Boot backend. The frontend is already complete. This file guides AI coding agents (e.g. Codex) on how to implement the backend.

---

## Repository Structure

```
MyHotel/
├── pom.xml                        # Maven build file
├── src/
│   ├── main/
│   │   ├── java/com/demo/ai/myhotel/   # Backend source code
│   │   ├── resources/
│   │   │   └── application.properties  # Spring Boot config
│   │   └── webapp/                     # Frontend (React, do not modify)
│   └── test/
│       └── java/com/demo/ai/myhotel/   # Backend tests
```

---

## Backend Technology Stack

| Layer | Technology                                  |
|---|---------------------------------------------|
| Language | Java 17                                     |
| Framework | Spring Boot 3.5                             |
| Build Tool | Maven                                       |
| Web | Spring MVC (REST API)                       |
| Persistence | Mybatis-Plus                                |
| Database | MySQL 5.7 (production) / H2 (test)          |
| Testing | JUnit 5 + Mockito                           |

> When adding a new dependency, add it to `pom.xml` only. Do not change the Spring Boot parent version (3.5.14).

---

## Package Structure Convention

All backend code lives under `com.demo.ai.myhotel`. Follow this layered structure strictly:

```
com.demo.ai.myhotel
├── controller      # REST controllers (@RestController)
├── service         # Business logic interfaces and implementations
├── repository      # Spring Data JPA repositories
├── entity          # JPA entities (@Entity)
├── dto             # Request / Response DTOs (no JPA annotations)
├── mapper          # Entity <-> DTO conversion (MapStruct preferred)
├── config          # Spring configuration classes
├── exception       # Custom exceptions and global exception handler
└── util            # Stateless utility classes
```

---

## Business Modules

The frontend has the following pages — implement matching REST APIs for each:

| Frontend Route | Module | Suggested API Prefix |
|---|---|---|
| `/` | Room listing / home | `GET /api/rooms` |
| `/booking` | Room booking | `POST /api/bookings` |
| `/checkin` | Check-in management | `POST /api/checkins` |
| `/orders` | Order management | `GET /api/orders` |

---

## REST API Design Rules

- Base path: `/api/**`
- Use standard HTTP methods: `GET` (query), `POST` (create), `PUT` (full update), `PATCH` (partial update), `DELETE` (remove)
- Always wrap responses in a unified envelope:

```json
{
  "code": 200,
  "message": "success",
  "data": { }
}
```

- Return appropriate HTTP status codes (`200`, `201`, `400`, `401`, `403`, `404`, `500`)
- Use `@Valid` on all request body parameters
- Paginated list endpoints must accept `page` (0-based) and `size` query params and return total count

---

## Coding Standards

### General

- Java 17 features are encouraged: records, sealed classes, text blocks, `var`
- Prefer constructor injection over field injection (`@Autowired` on fields is forbidden)
- Never suppress exceptions silently — always log or rethrow with context
- No magic numbers or strings — use constants or enums

### Naming

- Classes: `PascalCase`
- Methods and variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Database table names: `snake_case` (e.g. `room_booking`)
- REST endpoints: `kebab-case` plural nouns (e.g. `/api/room-bookings`)

### Entity Rules

- Every entity must have a `Long id` primary key with `@GeneratedValue(strategy = GenerationType.IDENTITY)`
- Include `createdAt` and `updatedAt` fields using `@CreationTimestamp` / `@UpdateTimestamp`
- Avoid bidirectional `@OneToMany` unless explicitly needed — prefer unidirectional

### DTO Rules

- Separate DTOs for request and response (e.g. `BookingRequest`, `BookingResponse`)
- Use Java records for immutable DTOs where possible
- Never expose entity classes directly in API responses

### Exception Handling

- Define custom exceptions in `exception/` package (e.g. `ResourceNotFoundException`, `BusinessException`)
- Use a single `@RestControllerAdvice` class for global exception handling
- Return the unified response envelope on errors too

### Testing

- Every `Service` class must have a corresponding unit test using Mockito
- Repository tests use `@DataJpaTest` with H2 in-memory database
- Integration tests use `@SpringBootTest`
- Test method naming: `methodName_givenCondition_expectedResult`

---

## application.properties Conventions

- All custom properties are prefixed with `myhotel.`
- Do not hardcode secrets — use environment variable placeholders: `${DB_PASSWORD}`
- Keep `application.properties` for shared config; use `application-dev.properties` and `application-prod.properties` for environment-specific overrides

---

## What NOT to Do

- Do not modify any files under `src/main/webapp/` — the frontend is complete
- Do not change the Maven parent version
- Do not use `@Autowired` on fields
- Do not return JPA entities directly from controllers
- Do not write business logic inside controllers
- Do not commit sensitive credentials to source code