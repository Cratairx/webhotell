import { bookingServiceRequest, buildQueryString } from "./apiClient.js";

export const ROOM_TYPES = ["SINGLE", "DOUBLE"];

export function fetchAllRooms() {
  return bookingServiceRequest("/api/rooms");
}

export function fetchRoomById(roomId) {
  return bookingServiceRequest(`/api/rooms/${roomId}`);
}

export function createRoom(roomNumber, roomType) {
  const queryString = buildQueryString({ roomNumber, roomType });
  return bookingServiceRequest(`/api/rooms${queryString}`, { method: "POST" });
}

export function updateRoom(roomId, roomNumber, roomType) {
  const queryString = buildQueryString({ roomNumber, roomType });
  return bookingServiceRequest(`/api/rooms/${roomId}${queryString}`, { method: "PUT" });
}

export function deleteRoom(roomId) {
  return bookingServiceRequest(`/api/rooms/${roomId}`, { method: "DELETE" });
}
