import { bookingServiceRequest, buildQueryString } from "./apiClient.js";

export function fetchAllBookings() {
  return bookingServiceRequest("/api/bookings");
}

/** Both dates are required and startDate must be before endDate, otherwise the service answers 400. */
export function fetchAvailableRooms(startDate, endDate) {
  const queryString = buildQueryString({ startDate, endDate });
  return bookingServiceRequest(`/api/bookings/available${queryString}`);
}

export function createBooking(customerId, roomId, startDate, endDate) {
  const queryString = buildQueryString({ customerId, roomId, startDate, endDate });
  return bookingServiceRequest(`/api/bookings${queryString}`, { method: "POST" });
}

export function updateBooking(bookingId, roomId, startDate, endDate) {
  const queryString = buildQueryString({ roomId, startDate, endDate });
  return bookingServiceRequest(`/api/bookings/${bookingId}${queryString}`, { method: "PUT" });
}

export function deleteBooking(bookingId) {
  return bookingServiceRequest(`/api/bookings/${bookingId}`, { method: "DELETE" });
}
