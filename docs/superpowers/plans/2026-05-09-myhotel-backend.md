# MyHotel Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first Spring Boot backend API for rooms, bookings, order queries, and check-ins while leaving the completed React frontend unchanged.

**Architecture:** Use a layered Spring MVC backend under `com.demo.ai.myhotel`, with DTO records at the API boundary, service interfaces for business behavior, MyBatis-Plus mapper interfaces for persistence, and a global exception handler for unified envelopes. H2 is the default runtime database and a production profile holds MySQL placeholders.

**Tech Stack:** Java 17, Spring Boot 3.5.14, Spring MVC, Bean Validation, MyBatis-Plus, H2, MySQL Connector/J, JUnit 5, Mockito, MockMvc.

---

## File Structure

- Modify `pom.xml`: add web, validation, MyBatis-Plus, H2, MySQL, and test support dependencies.
- Modify `src/main/resources/application.properties`: configure H2, MyBatis-Plus, SQL initialization, and `myhotel.` properties.
- Create `src/main/resources/application-prod.properties`: MySQL profile with environment placeholders.
- Create `src/main/resources/schema.sql`: portable schema for H2 and MySQL-compatible table names.
- Create `src/main/resources/data.sql`: seed three frontend-compatible room types.
- Create `src/main/java/com/demo/ai/myhotel/config/MybatisPlusConfig.java`: mapper scanning and optional MyBatis-Plus configuration.
- Create `src/main/java/com/demo/ai/myhotel/entity/Room.java`: room type persistence entity.
- Create `src/main/java/com/demo/ai/myhotel/entity/BookingOrder.java`: booking/order persistence entity.
- Create `src/main/java/com/demo/ai/myhotel/entity/OrderStatus.java`: order status enum with API values.
- Create `src/main/java/com/demo/ai/myhotel/mapper/RoomMapper.java`: MyBatis-Plus mapper for rooms.
- Create `src/main/java/com/demo/ai/myhotel/mapper/BookingOrderMapper.java`: MyBatis-Plus mapper for orders.
- Create `src/main/java/com/demo/ai/myhotel/dto/ApiResponse.java`: unified response envelope.
- Create `src/main/java/com/demo/ai/myhotel/dto/PageResponse.java`: paginated response DTO.
- Create `src/main/java/com/demo/ai/myhotel/dto/RoomResponse.java`: room API response.
- Create `src/main/java/com/demo/ai/myhotel/dto/BookingRequest.java`: booking API request with validation.
- Create `src/main/java/com/demo/ai/myhotel/dto/OrderResponse.java`: order API response.
- Create `src/main/java/com/demo/ai/myhotel/dto/CheckinRequest.java`: check-in API request with validation.
- Create `src/main/java/com/demo/ai/myhotel/mapper/RoomDtoMapper.java`: room entity to DTO conversion.
- Create `src/main/java/com/demo/ai/myhotel/mapper/OrderDtoMapper.java`: order entity to DTO conversion.
- Create `src/main/java/com/demo/ai/myhotel/exception/BusinessException.java`: business validation exception.
- Create `src/main/java/com/demo/ai/myhotel/exception/ResourceNotFoundException.java`: missing resource exception.
- Create `src/main/java/com/demo/ai/myhotel/exception/GlobalExceptionHandler.java`: unified error responses.
- Create `src/main/java/com/demo/ai/myhotel/util/OrderNumberGenerator.java`: public order number generator.
- Create `src/main/java/com/demo/ai/myhotel/util/RoomNumberGenerator.java`: physical room number generator.
- Create `src/main/java/com/demo/ai/myhotel/service/RoomService.java`: room query service contract.
- Create `src/main/java/com/demo/ai/myhotel/service/BookingService.java`: booking creation contract.
- Create `src/main/java/com/demo/ai/myhotel/service/OrderService.java`: order query contract.
- Create `src/main/java/com/demo/ai/myhotel/service/CheckinService.java`: check-in contract.
- Create `src/main/java/com/demo/ai/myhotel/service/impl/RoomServiceImpl.java`: room query implementation.
- Create `src/main/java/com/demo/ai/myhotel/service/impl/BookingServiceImpl.java`: booking creation implementation.
- Create `src/main/java/com/demo/ai/myhotel/service/impl/OrderServiceImpl.java`: order query implementation.
- Create `src/main/java/com/demo/ai/myhotel/service/impl/CheckinServiceImpl.java`: check-in implementation.
- Create `src/main/java/com/demo/ai/myhotel/controller/RoomController.java`: `GET /api/rooms`.
- Create `src/main/java/com/demo/ai/myhotel/controller/BookingController.java`: `POST /api/bookings`.
- Create `src/main/java/com/demo/ai/myhotel/controller/OrderController.java`: `GET /api/orders` and `GET /api/orders/{orderNo}`.
- Create `src/main/java/com/demo/ai/myhotel/controller/CheckinController.java`: `POST /api/checkins`.
- Create service unit tests under `src/test/java/com/demo/ai/myhotel/service/impl/`.
- Create controller integration tests under `src/test/java/com/demo/ai/myhotel/controller/`.

## Task 1: Dependencies And Baseline

**Files:**
- Modify: `pom.xml`
- Modify: `src/main/resources/application.properties`
- Create: `src/main/resources/application-prod.properties`
- Create: `src/main/resources/schema.sql`
- Create: `src/main/resources/data.sql`

- [ ] **Step 1: Run the current baseline test**

Run: `./mvnw test`

Expected: the existing context test either passes or fails only because backend dependencies/configuration are not yet present.

- [ ] **Step 2: Add backend dependencies**

Add these dependencies to `pom.xml` while keeping Spring Boot parent `3.5.14`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-spring-boot3-starter</artifactId>
    <version>3.5.12</version>
</dependency>
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```

- [ ] **Step 3: Configure H2 and SQL initialization**

`application.properties` must define the application name, H2 datasource, MyBatis-Plus underscore mapping, SQL init, and `myhotel.room-number.*` settings.

- [ ] **Step 4: Add schema and seed data**

Create `room` and `booking_order` tables with snake_case columns and seed `deluxe`, `twin`, and `suite` rows.

- [ ] **Step 5: Run dependency/config baseline**

Run: `./mvnw test`

Expected: dependency resolution succeeds and the application context reaches the next missing-code failure, or passes if no new code is referenced yet.

## Task 2: DTOs, Entities, Exceptions, And Utilities

**Files:**
- Create: entity, DTO, exception, and util files listed in File Structure.
- Test: `src/test/java/com/demo/ai/myhotel/service/impl/BookingServiceImplTest.java`

- [ ] **Step 1: Write failing booking service tests**

Test creation success, unknown room type, invalid date range, and invalid check-in date before implementation.

- [ ] **Step 2: Run test to verify RED**

Run: `./mvnw -Dtest=BookingServiceImplTest test`

Expected: compilation fails because service/entity/DTO classes do not exist yet.

- [ ] **Step 3: Add shared model code**

Implement DTO records, entities with `Long id`, `createdAt`, `updatedAt`, status enum, exceptions, and order/room number generators.

- [ ] **Step 4: Run booking tests**

Run: `./mvnw -Dtest=BookingServiceImplTest test`

Expected: failures move from missing classes to missing service implementation behavior.

## Task 3: Mapper Interfaces And Booking Service

**Files:**
- Create: `src/main/java/com/demo/ai/myhotel/mapper/RoomMapper.java`
- Create: `src/main/java/com/demo/ai/myhotel/mapper/BookingOrderMapper.java`
- Create: `src/main/java/com/demo/ai/myhotel/mapper/RoomDtoMapper.java`
- Create: `src/main/java/com/demo/ai/myhotel/mapper/OrderDtoMapper.java`
- Create: `src/main/java/com/demo/ai/myhotel/service/BookingService.java`
- Create: `src/main/java/com/demo/ai/myhotel/service/impl/BookingServiceImpl.java`
- Test: `src/test/java/com/demo/ai/myhotel/service/impl/BookingServiceImplTest.java`

- [ ] **Step 1: Implement minimal booking service**

Use `RoomMapper.selectOne` to resolve room by code, validate dates and guest count, calculate nights/total, insert `BookingOrder`, and return `OrderResponse`.

- [ ] **Step 2: Run booking tests to verify GREEN**

Run: `./mvnw -Dtest=BookingServiceImplTest test`

Expected: booking service tests pass.

## Task 4: Room And Order Query Services

**Files:**
- Create: `src/main/java/com/demo/ai/myhotel/service/RoomService.java`
- Create: `src/main/java/com/demo/ai/myhotel/service/OrderService.java`
- Create: `src/main/java/com/demo/ai/myhotel/service/impl/RoomServiceImpl.java`
- Create: `src/main/java/com/demo/ai/myhotel/service/impl/OrderServiceImpl.java`
- Test: `src/test/java/com/demo/ai/myhotel/service/impl/RoomServiceImplTest.java`
- Test: `src/test/java/com/demo/ai/myhotel/service/impl/OrderServiceImplTest.java`

- [ ] **Step 1: Write failing room and order service tests**

Test paginated room listing, keyword order search, and missing order lookup.

- [ ] **Step 2: Run tests to verify RED**

Run: `./mvnw -Dtest=RoomServiceImplTest,OrderServiceImplTest test`

Expected: compilation or behavior failures for missing services.

- [ ] **Step 3: Implement room and order services**

Use MyBatis-Plus `Page` and `LambdaQueryWrapper` for pagination and keyword filtering.

- [ ] **Step 4: Run tests to verify GREEN**

Run: `./mvnw -Dtest=RoomServiceImplTest,OrderServiceImplTest test`

Expected: room and order service tests pass.

## Task 5: Check-In Service

**Files:**
- Create: `src/main/java/com/demo/ai/myhotel/service/CheckinService.java`
- Create: `src/main/java/com/demo/ai/myhotel/service/impl/CheckinServiceImpl.java`
- Test: `src/test/java/com/demo/ai/myhotel/service/impl/CheckinServiceImplTest.java`

- [ ] **Step 1: Write failing check-in tests**

Test successful check-in, already checked-in idempotency, ID tail mismatch, missing order, and invalid status.

- [ ] **Step 2: Run test to verify RED**

Run: `./mvnw -Dtest=CheckinServiceImplTest test`

Expected: compilation or behavior failures for missing check-in implementation.

- [ ] **Step 3: Implement check-in service**

Find by order number, compare `idNumberTail`, preserve existing room if already checked in, reject non-booked statuses, assign room number, update status and room number.

- [ ] **Step 4: Run test to verify GREEN**

Run: `./mvnw -Dtest=CheckinServiceImplTest test`

Expected: check-in service tests pass.

## Task 6: Controllers And Global API Contract

**Files:**
- Create: controller files listed in File Structure.
- Create: `src/main/java/com/demo/ai/myhotel/exception/GlobalExceptionHandler.java`
- Test: `src/test/java/com/demo/ai/myhotel/controller/HotelApiIntegrationTest.java`

- [ ] **Step 1: Write failing MockMvc integration tests**

Test `GET /api/rooms`, `POST /api/bookings`, `GET /api/orders`, `GET /api/orders/{orderNo}`, and `POST /api/checkins` return the unified envelope and expected status codes.

- [ ] **Step 2: Run integration tests to verify RED**

Run: `./mvnw -Dtest=HotelApiIntegrationTest test`

Expected: failures because controllers and exception advice are missing.

- [ ] **Step 3: Implement controllers and exception handler**

Controllers call services only, wrap success responses in `ApiResponse`, and use `@Valid` request bodies.

- [ ] **Step 4: Run integration tests to verify GREEN**

Run: `./mvnw -Dtest=HotelApiIntegrationTest test`

Expected: integration tests pass.

## Task 7: Full Verification

**Files:**
- All backend files created or modified above.

- [ ] **Step 1: Run the full backend test suite**

Run: `./mvnw test`

Expected: all tests pass with no compilation errors.

- [ ] **Step 2: Check frontend directory remains unchanged by this implementation**

Run: `git diff -- src/main/webapp`

Expected: no diff caused by backend implementation.

- [ ] **Step 3: Review backend diff**

Run: `git diff -- pom.xml src/main src/test docs/superpowers/plans/2026-05-09-myhotel-backend.md`

Expected: only backend implementation, backend tests, configuration, and the plan file changed.
