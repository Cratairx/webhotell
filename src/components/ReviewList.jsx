import { formatRatingStars } from "../utils/reviewFormatting.js";

/** Renders the reviews of a single room, newest first. */
export default function ReviewList({ reviews }) {
  if (reviews.length === 0) {
    return <p className="hint">No reviews for this room yet.</p>;
  }

  return (
    <ul className="review-list">
      {reviews.map((review) => (
        <li key={review.id} className="review-item">
          <div className="review-item-header">
            <span className="review-rating">{formatRatingStars(review.rating)}</span>
            <span className="review-meta">
              Booking {review.bookingId}
              {review.createdAt ? " - " + review.createdAt.slice(0, 10) : ""}
            </span>
          </div>
          {review.comment && <p className="review-comment">{review.comment}</p>}
        </li>
      ))}
    </ul>
  );
}
