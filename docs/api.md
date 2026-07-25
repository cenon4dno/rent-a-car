# API Reference

Base URL (local dev): `http://localhost:4000/api/v1`  
Interactive docs (Swagger): `http://localhost:4000/api/docs`

---

## Authentication

The API uses **JWT Bearer tokens**. Obtain a token via SSO or password login, then include it in all authenticated requests:

```
Authorization: Bearer <token>
```

### Endpoints

#### SSO Login (Google / Microsoft / Apple / Meta)

```
POST /auth/sso
Body: { "provider": "google", "token": "<oauth-id-token>" }
Response: { "data": { "token": "...", "user": { ... } } }
```

#### Password Login

```
POST /auth/login
Body: { "email": "admin@example.com", "password": "..." }
Response: { "data": { "token": "...", "user": { ... } } }
```

#### Get Current User

```
GET /auth/me
Auth: Required
Response: { "data": { "id": "...", "email": "...", "role": "CUSTOMER", ... } }
```

---

## Users

```
GET    /users/me                    Get own profile
PATCH  /users/me                    Update own profile (name, phone, avatarUrl)
PATCH  /users/me/password           Change password
GET    /users/:id                   Get user by ID (Admin only)
PATCH  /users/:id/kyc-status        Update KYC status (Admin only)
POST   /users/kyc/upload            Upload KYC documents (multipart/form-data)
```

---

## Vehicles

```
GET    /vehicles                    Search vehicles
  ?location=Manila
  ?startDate=2026-08-01
  ?endDate=2026-08-05
  ?minPrice=500&maxPrice=5000
  ?fuelType=GASOLINE|DIESEL|HYBRID|ELECTRIC
  ?transmission=MANUAL|AUTOMATIC|CVT
  ?seatingCapacity=5
  ?tag=SUV|Family|Business
  ?lat=14.5995&lng=120.9842

GET    /vehicles/:id                Get vehicle detail
POST   /vehicles                    Create vehicle (RENTER)
PATCH  /vehicles/:id                Update vehicle (RENTER, owner only)
DELETE /vehicles/:id                Delete vehicle (RENTER, owner only)
POST   /vehicles/:id/photos         Upload vehicle photos
GET    /vehicles/my                 List own fleet (RENTER)
GET    /vehicles/my/analytics       Fleet utilization + revenue BI (RENTER)
GET    /vehicles/my/demographics    Customer demographic breakdown (RENTER)
```

---

## Bookings

```
POST   /bookings                    Create booking
  Body: { vehicleId, startDate, endDate, pickupLocation, pickupLat?, pickupLng?, addonsAmount? }

GET    /bookings                    List own bookings (CUSTOMER)
GET    /bookings/:id                Get booking detail
PATCH  /bookings/:id/confirm        Confirm booking (RENTER)
PATCH  /bookings/:id/cancel         Cancel booking (CUSTOMER or RENTER)
PATCH  /bookings/:id/complete       Mark complete (RENTER)
POST   /bookings/:id/assign-driver  Assign driver (RENTER)
POST   /bookings/:id/sos            Trigger SOS — notifies renter + admins
POST   /bookings/:id/late-return    Charge late return penalty (RENTER)
POST   /bookings/:id/driver-no-show Report driver no-show → auto refund + penalty flag (CUSTOMER)
GET    /bookings/renter             List bookings for own fleet (RENTER)
```

### Booking statuses

```
PENDING → CONFIRMED → ACTIVE → COMPLETED
         ↓           ↓
       CANCELLED  CANCELLED
```

---

## Payments

```
POST   /payments/create             Create payment intent
  Body: { bookingId, method: "card"|"gcash"|"maya" }

POST   /payments/confirm/:id        Confirm payment (card)
POST   /payments/refund/:id         Process refund
POST   /payments/webhook/paymongo   PayMongo webhook receiver (HMAC-verified)
```

---

## Messages (WebSocket + REST)

### REST

```
GET    /messages/conversations          List own conversations
POST   /messages/conversations          Open/get conversation with a user
  Body: { participantId: "..." }

GET    /messages/conversations/:id      Get messages in a conversation
POST   /messages/conversations/:id/messages   Send a message
  Body: { content: "..." }

GET    /messages/unread-count           Count unread messages
```

### WebSocket

Connect to `ws://localhost:4000/ws` with:

```js
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000/ws', {
  auth: { token: '<jwt-token>' },
});

socket.on('message:new', (message) => {
  // { id, conversationId, senderId, content, createdAt }
});
```

---

## Reviews

```
POST   /reviews                     Post a review (CUSTOMER, after booking)
  Body: { bookingId, vehicleId, rating, comment }

GET    /reviews/vehicle/:id         Get reviews for a vehicle
POST   /reviews/renter              Post renter review of a customer (RENTER)
GET    /reviews/renter/:customerId  Get renter reviews for a customer
```

---

## Drivers

```
POST   /drivers                     Register a driver under own company (RENTER)
GET    /drivers/my                  List own drivers (RENTER)
GET    /drivers/dashboard           Driver's own schedule (DRIVER)
GET    /drivers/:id                 Public driver profile
GET    /drivers/:id/private         Private driver profile (RENTER, owner only)
DELETE /drivers/:id                 Remove driver (RENTER, owner only)
```

---

## Feedback

```
POST   /feedback                    Submit feedback / complaint / inquiry (public)
  Body: { name, email, subject, category: "Complaint"|"Feedback"|"Suggestion"|"Inquiry", message }

GET    /feedback                    List all feedback (ADMIN)
PATCH  /feedback/:id                Update status + admin reply (ADMIN)
  Body: { status: "NEW"|"IN_REVIEW"|"RESOLVED", adminReply? }
```

---

## Admin

```
GET    /admin/users                 List all users
GET    /admin/users/:id             Get user details
PATCH  /admin/users/:id/role        Change user role
PATCH  /admin/users/:id/suspend     Suspend a user
GET    /admin/renters/:id           Get renter profile
PATCH  /admin/renters/:id/commission  Update commission rate
  Body: { commissionRate: 0.05 }

GET    /admin/bi/overview           Platform GMV, revenue, active users
GET    /admin/bi/renters            Renter acquisition metrics

GET    /homepage-config             Get homepage carousel + featured config (public)
PATCH  /homepage-config             Update homepage config (ADMIN)
  Body: {
    slides: [{ id, image, headline, subtext, ctaLabel, ctaLink }],
    featuredMode: "AUTO"|"MANUAL",
    featuredIds: ["vehicleId1", ...]
  }
```

---

## Legal / CMS

```
GET    /legal/:slug                 Get legal page by slug (public)
POST   /legal                       Create legal page (ADMIN)
PATCH  /legal/:id                   Update legal page (ADMIN)
DELETE /legal/:id                   Delete legal page (ADMIN)
```

---

## Standard Response Envelope

All responses follow:

```json
{ "data": { ... } }
```

Errors:

```json
{
  "statusCode": 400,
  "message": "Validation error description",
  "error": "Bad Request"
}
```

Common status codes: `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict` (booking overlap), `500 Internal Server Error`.
