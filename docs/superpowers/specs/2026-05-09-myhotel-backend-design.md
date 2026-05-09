# MyHotel Backend Design

Date: 2026-05-09

## Scope

Build the first backend API for the MyHotel hotel management system. The React frontend under `src/main/webapp/` is already complete and must not be changed in this phase.

The backend will expose REST APIs matching the existing frontend workflows:

- Room listing / home
- Room booking
- Order query
- Check-in management

This phase delivers backend functionality only. Frontend integration can be handled later by replacing the current local storage store with API calls.

## Technology Choices

- Java 17
- Spring Boot 3.5.14, keeping the existing parent version
- Spring MVC for REST APIs
- MyBatis-Plus for persistence
- H2 for local development and automated tests
- MySQL 5.7 configuration through a production profile
- JUnit 5 and Mockito for tests

Dependencies will be added only in `pom.xml`.

## Package Layout

All backend code will live under `com.demo.ai.myhotel`.

- `controller`: REST controllers
- `service`: service interfaces and implementations
- `repository`: reserved for repository-style persistence support if needed
- `entity`: persistence entities
- `dto`: request and response records
- `mapper`: MyBatis-Plus mapper interfaces and DTO converters
- `config`: Spring configuration
- `exception`: custom exceptions and global error handling
- `util`: stateless helpers

## Data Model

### Room

Rooms represent bookable room types, not individual physical rooms.

Fields:

- `id`: `Long`, generated primary key
- `code`: stable room type code such as `deluxe`, `twin`, or `suite`
- `name`
- `description`
- `price`
- `bed`
- `size`
- `imageKey`: frontend-facing image identifier
- `createdAt`
- `updatedAt`

The first version seeds three room types that match the frontend:

- `deluxe`: 豪华大床房, ¥888
- `twin`: 高级双床房, ¥728
- `suite`: 行政套房, ¥1688

### Booking / Order

Bookings are exposed to users as orders.

Fields:

- `id`: `Long`, generated primary key
- `orderNo`: public order number, generated with `HT` prefix
- `guestName`
- `phone`
- `idNumber`
- `roomTypeCode`
- `roomTypeName`
- `checkInDate`
- `checkOutDate`
- `nights`
- `guests`
- `totalPrice`
- `status`: `booked`, `checked_in`, `checked_out`, or `cancelled`
- `roomNumber`: assigned during check-in
- `createdAt`
- `updatedAt`

The first version does not implement inventory locking, payment, cancellation, or checkout endpoints because the current frontend has no entry for them.

## API Envelope

All responses use the same shape:

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

Validation and business errors also use the same envelope with the matching HTTP status code.

## API Endpoints

### `GET /api/rooms`

Returns the available room types.

Query parameters:

- `page`: 0-based page number, default `0`
- `size`: page size, default `20`

Response data contains:

- `items`
- `page`
- `size`
- `total`

### `POST /api/bookings`

Creates a booking order.

Request fields:

- `guestName`: required
- `phone`: required, 11 digit mainland China mobile format
- `idNumber`: required
- `roomTypeId`: required, mapped to `Room.code`
- `checkIn`: required date, not before today
- `checkOut`: required date, after `checkIn`
- `guests`: required, 1 to 4

Behavior:

- Validate the room type exists.
- Calculate nights from `checkIn` and `checkOut`.
- Calculate total price from room price times nights.
- Generate a public order number.
- Persist the order with status `booked`.
- Return the order response with HTTP `201`.

### `GET /api/orders`

Returns paginated orders.

Query parameters:

- `q`: optional keyword, matched against order number, guest name, and phone
- `page`: 0-based page number, default `0`
- `size`: page size, default `20`

Response data contains:

- `items`
- `page`
- `size`
- `total`

### `GET /api/orders/{orderNo}`

Returns a single order by public order number.

Missing orders return `404`.

### `POST /api/checkins`

Checks in a booked order.

Request fields:

- `orderNo`: required
- `idNumberTail`: required, last 4 characters of the guest ID number

Behavior:

- Find the order by public order number.
- If already checked in, return the existing checked-in order.
- Reject orders not in `booked` status.
- Verify the ID number tail.
- Assign a room number.
- Update status to `checked_in`.
- Return the updated order.

Room numbers are generated in the same practical style as the frontend prototype: floor 8 to 19 plus room 01 to 20.

## Validation And Errors

Custom exceptions:

- `ResourceNotFoundException` for missing room types and orders
- `BusinessException` for invalid business transitions, such as checking in a cancelled order

Global exception handling:

- `MethodArgumentNotValidException`: `400`
- `ConstraintViolationException`: `400`
- `ResourceNotFoundException`: `404`
- `BusinessException`: `400`
- unexpected exceptions: `500`

Controllers contain no business logic beyond request binding and response status selection.

## Configuration

Default `application.properties` uses H2 so the backend can run and test without external services.

Production MySQL configuration lives in `application-prod.properties` and uses environment variable placeholders such as:

- `${DB_HOST}`
- `${DB_PORT}`
- `${DB_NAME}`
- `${DB_USERNAME}`
- `${DB_PASSWORD}`

Custom properties use the `myhotel.` prefix.

## Testing Strategy

Use test-first implementation for service behavior.

Service unit tests:

- booking creates an order with calculated nights and total price
- booking rejects unknown room types
- booking rejects invalid date ranges
- order search filters by keyword and paginates
- check-in succeeds with a valid order and ID tail
- check-in returns an existing room for already checked-in orders
- check-in rejects ID tail mismatch
- check-in rejects invalid order states

Integration tests:

- application context loads with H2
- representative controller flows return the unified envelope and expected HTTP statuses

## Out Of Scope

- Frontend changes under `src/main/webapp/`
- Authentication and authorization
- Payment
- Room inventory capacity and oversell prevention
- Cancellation and checkout endpoints
- Audit logs
- External SMS or notification integration
