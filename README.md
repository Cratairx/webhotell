# Hotel Booking Frontend

React frontend for the Spring Boot services in this repository.

## Running

```
npm install
npm run dev
```

The app is served on <http://localhost:5173>. The port is pinned in `vite.config.js`
because both services allow CORS from that origin only — if Vite moved to another
port, every request would be blocked by the browser.

Start `customerservice` (port 8080), `OrderService` (port 8081) and `review-service`
(port 8082) before using the app.

## Service addresses

Configured in `.env`:

```
VITE_CUSTOMER_SERVICE_URL=http://localhost:8080
VITE_BOOKING_SERVICE_URL=http://localhost:8081
VITE_REVIEW_SERVICE_URL=http://localhost:8082
```

## Structure

| Path | Purpose |
| --- | --- |
| `src/api/apiClient.js` | fetch wrapper: base URLs, query strings, error handling |
| `src/api/customerApi.js` | CustomerService endpoints |
| `src/api/roomApi.js` | OrderService room endpoints |
| `src/api/bookingApi.js` | OrderService booking endpoints |
| `src/api/reviewApi.js` | review-service endpoints |
| `src/pages/` | One page per resource: customers, rooms, bookings |
| `src/components/` | Navigation bar, status banner, loading indicator, review list |
| `src/utils/` | Rating formatting and the "has the booking passed" check |

## Notes on the backend contract

- Customer update is `POST /api/customer/{id}`, and delete is `POST /api/customer/{id}/delete`.
- Room and booking writes take **query parameters**, not a JSON body.
- `GET /api/bookings/available` requires both dates, with `startDate` strictly before `endDate`.
- A booking carries `customerID` (capital D) and a nested `room` object.
- Reviews take a JSON body and only need `bookingId`, `customerId`, `rating` and `comment`;
  the service looks the booking up itself to fill in `roomId`.
- `POST /api/reviews` is refused while the stay is still running, when the booking belongs to
  another customer, and when the booking was already reviewed. The Bookings page therefore only
  offers the Review button once `endDate` has passed.
