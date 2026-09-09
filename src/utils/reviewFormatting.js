/** "4" becomes "★★★★☆ (4/5)", so the table stays readable without an icon set. */
export function formatRatingStars(rating) {
  const filledCount = Math.max(0, Math.min(5, Number(rating) || 0));
  return "\u2605".repeat(filledCount) + "\u2606".repeat(5 - filledCount) + " (" + filledCount + "/5)";
}

export function calculateAverageRating(reviews) {
  if (reviews.length === 0) {
    return null;
  }
  const total = reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0);
  return (total / reviews.length).toFixed(1);
}

/** Today as "YYYY-MM-DD" in local time, so it compares with the ISO dates the services send. */
export function todayAsIsoDate() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return now.getFullYear() + "-" + month + "-" + day;
}

/** The service only accepts a review once the stay is over, so the UI hides the button until then. */
export function hasBookingPassed(booking) {
  if (!booking.endDate) {
    return false;
  }
  return booking.endDate <= todayAsIsoDate();
}
