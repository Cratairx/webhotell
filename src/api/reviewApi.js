import { jsonRequestOptions, reviewServiceRequest } from "./apiClient.js";

export const RATING_VALUES = [1, 2, 3, 4, 5];

/**
 * The service looks the booking up itself, so it derives roomId and rejects the
 * review when the booking belongs to someone else, has not ended yet, or was
 * already reviewed.
 */
export function createReview(bookingId, customerId, rating, comment) {
  return reviewServiceRequest(
    "/api/reviews",
    jsonRequestOptions("POST", {
      bookingId: Number(bookingId),
      customerId: Number(customerId),
      rating: Number(rating),
      comment
    })
  );
}

export function fetchReviewsForRoom(roomId) {
  return reviewServiceRequest(`/api/reviews/room/${roomId}`);
}
