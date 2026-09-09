/** Digits only, so "12A" and "10!" are rejected before they reach the booking service. */
export const ROOM_NUMBER_PATTERN = /^[0-9]+$/;

/** The usual address shape: local part, @, domain, dot, tld. */
export const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

/** Returns an error message, or null when the room number is valid. */
export function validateRoomNumber(roomNumber) {
  const trimmedRoomNumber = String(roomNumber ?? "").trim();
  if (trimmedRoomNumber === "") {
    return "Room number is required.";
  }
  if (!ROOM_NUMBER_PATTERN.test(trimmedRoomNumber)) {
    return "Room number may only contain numbers.";
  }
  return null;
}

/** Returns an error message, or null when the email is valid. */
export function validateEmail(email) {
  const trimmedEmail = String(email ?? "").trim();
  if (trimmedEmail === "") {
    return "Email is required.";
  }
  if (!EMAIL_PATTERN.test(trimmedEmail)) {
    return "Enter a valid email address, for example name@example.com.";
  }
  return null;
}
