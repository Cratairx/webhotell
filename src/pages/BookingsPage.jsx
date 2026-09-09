import { Fragment, useEffect, useState } from "react";
import {
  createBooking,
  deleteBooking,
  fetchAllBookings,
  fetchAvailableRooms,
  updateBooking
} from "../api/bookingApi.js";
import { fetchAllRooms } from "../api/roomApi.js";
import { fetchAllCustomers } from "../api/customerApi.js";
import { createReview, fetchReviewsForRoom, RATING_VALUES } from "../api/reviewApi.js";
import { hasBookingPassed } from "../utils/reviewFormatting.js";
import StatusMessage from "../components/StatusMessage.jsx";
import LoadingIndicator from "../components/LoadingIndicator.jsx";

const emptyBookingForm = { customerId: "", roomId: "", startDate: "", endDate: "" };
const emptyReviewForm = { rating: 5, comment: "" };

/** The service requires both dates and startDate strictly before endDate, so the UI enforces the same rule. */
function isValidDateRange(startDate, endDate) {
  if (startDate === "" || endDate === "") {
    return false;
  }
  return startDate < endDate;
}

function describeCustomer(customers, customerId) {
  const matchingCustomer = customers.find((customer) => customer.id === customerId);
  if (!matchingCustomer) {
    return "Unknown customer (id " + customerId + ")";
  }
  return matchingCustomer.firstName + " " + matchingCustomer.lastName;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [availableRooms, setAvailableRooms] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [bookingForm, setBookingForm] = useState(emptyBookingForm);
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [editBookingForm, setEditBookingForm] = useState(emptyBookingForm);
  const [reviewingBookingId, setReviewingBookingId] = useState(null);
  const [reviewForm, setReviewForm] = useState(emptyReviewForm);
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [reviewedBookingIds, setReviewedBookingIds] = useState([]);

  useEffect(() => {
    loadEverything();
  }, []);

  async function loadEverything() {
    setIsLoading(true);
    try {
      const [loadedBookings, loadedCustomers, loadedRooms] = await Promise.all([
        fetchAllBookings(),
        fetchAllCustomers(),
        fetchAllRooms()
      ]);
      setBookings(loadedBookings ?? []);
      setCustomers(loadedCustomers ?? []);
      setRooms(loadedRooms ?? []);
      await loadReviewedBookingIds(loadedBookings ?? []);
    } catch (error) {
      setFeedback({ type: "error", text: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * The review service can only be asked per room, so every room that shows up in the
   * bookings is queried. A failure is swallowed on purpose: the bookings table still has
   * to render when the review service is down, and that service refuses a second review
   * for the same booking anyway.
   */
  async function loadReviewedBookingIds(loadedBookings) {
    const roomIds = [
      ...new Set(
        loadedBookings
          .map((booking) => (booking.room ? booking.room.id : null))
          .filter((roomId) => roomId !== null)
      )
    ];
    try {
      const reviewsPerRoom = await Promise.all(
        roomIds.map((roomId) => fetchReviewsForRoom(roomId))
      );
      setReviewedBookingIds(reviewsPerRoom.flat().map((review) => review.bookingId));
    } catch (error) {
      setReviewedBookingIds([]);
    }
  }

  async function reloadBookings() {
    try {
      const loadedBookings = await fetchAllBookings();
      setBookings(loadedBookings ?? []);
    } catch (error) {
      setFeedback({ type: "error", text: error.message });
    }
  }

  function updateBookingFormField(fieldName, fieldValue) {
    setBookingForm((previousForm) => ({ ...previousForm, [fieldName]: fieldValue }));
    // A changed date range invalidates the room list from the previous search.
    if (fieldName === "startDate" || fieldName === "endDate") {
      setAvailableRooms(null);
      setBookingForm((previousForm) => ({ ...previousForm, roomId: "" }));
    }
  }

  function updateEditBookingField(fieldName, fieldValue) {
    setEditBookingForm((previousForm) => ({ ...previousForm, [fieldName]: fieldValue }));
  }

  function updateReviewField(fieldName, fieldValue) {
    setReviewForm((previousForm) => ({ ...previousForm, [fieldName]: fieldValue }));
  }

  async function handleSearchAvailableRooms(submitEvent) {
    submitEvent.preventDefault();
    setIsSearching(true);
    setFeedback(null);
    try {
      const foundRooms = await fetchAvailableRooms(bookingForm.startDate, bookingForm.endDate);
      setAvailableRooms(foundRooms ?? []);
      if ((foundRooms ?? []).length === 0) {
        setFeedback({ type: "error", text: "No rooms are free for those dates." });
      }
    } catch (error) {
      setAvailableRooms([]);
      setFeedback({ type: "error", text: error.message });
    } finally {
      setIsSearching(false);
    }
  }

  async function handleCreateBooking(submitEvent) {
    submitEvent.preventDefault();
    try {
      await createBooking(
        bookingForm.customerId,
        bookingForm.roomId,
        bookingForm.startDate,
        bookingForm.endDate
      );
      setFeedback({ type: "success", text: "Booking created." });
      setBookingForm(emptyBookingForm);
      setAvailableRooms(null);
      await reloadBookings();
    } catch (error) {
      setFeedback({ type: "error", text: error.message });
    }
  }

  function startEditingBooking(booking) {
    setEditingBookingId(booking.id);
    setEditBookingForm({
      customerId: booking.customerID,
      roomId: booking.room ? booking.room.id : "",
      startDate: booking.startDate,
      endDate: booking.endDate
    });
    cancelReviewingBooking();
    setFeedback(null);
  }

  function cancelEditingBooking() {
    setEditingBookingId(null);
    setEditBookingForm(emptyBookingForm);
  }

  function startReviewingBooking(booking) {
    setReviewingBookingId(booking.id);
    setReviewForm(emptyReviewForm);
    setFeedback(null);
  }

  function cancelReviewingBooking() {
    setReviewingBookingId(null);
    setReviewForm(emptyReviewForm);
  }

  async function handleSaveBooking(bookingId) {
    if (!isValidDateRange(editBookingForm.startDate, editBookingForm.endDate)) {
      setFeedback({ type: "error", text: "The start date must be before the end date." });
      return;
    }
    try {
      await updateBooking(
        bookingId,
        editBookingForm.roomId,
        editBookingForm.startDate,
        editBookingForm.endDate
      );
      cancelEditingBooking();
      setFeedback({ type: "success", text: "Booking updated." });
      await reloadBookings();
    } catch (error) {
      setFeedback({ type: "error", text: error.message });
    }
  }

  async function handleDeleteBooking(booking) {
    const isConfirmed = window.confirm("Delete booking " + booking.id + "?");
    if (!isConfirmed) {
      return;
    }
    try {
      await deleteBooking(booking.id);
      setFeedback({ type: "success", text: "Booking deleted." });
      await reloadBookings();
    } catch (error) {
      setFeedback({ type: "error", text: error.message });
    }
  }

  async function handleSubmitReview(submitEvent, booking) {
    submitEvent.preventDefault();
    setIsSavingReview(true);
    try {
      await createReview(booking.id, booking.customerID, reviewForm.rating, reviewForm.comment);
      setReviewedBookingIds((previousIds) => [...previousIds, booking.id]);
      cancelReviewingBooking();
      setFeedback({ type: "success", text: "Thanks, your review was saved." });
    } catch (error) {
      setFeedback({ type: "error", text: error.message });
    } finally {
      setIsSavingReview(false);
    }
  }

  const hasValidSearchRange = isValidDateRange(bookingForm.startDate, bookingForm.endDate);
  const canCreateBooking =
    hasValidSearchRange && bookingForm.customerId !== "" && bookingForm.roomId !== "";

  return (
    <section>
      <h2>Bookings</h2>
      <StatusMessage feedback={feedback} onDismiss={() => setFeedback(null)} />

      <div className="card">
        <h3>New booking</h3>

        <form className="form-row" onSubmit={handleSearchAvailableRooms}>
          <label>
            Start date
            <input
              type="date"
              value={bookingForm.startDate}
              onChange={(changeEvent) =>
                updateBookingFormField("startDate", changeEvent.target.value)
              }
              required
            />
          </label>
          <label>
            End date
            <input
              type="date"
              value={bookingForm.endDate}
              onChange={(changeEvent) =>
                updateBookingFormField("endDate", changeEvent.target.value)
              }
              required
            />
          </label>
          <button type="submit" disabled={!hasValidSearchRange || isSearching}>
            {isSearching ? "Searching..." : "Search available rooms"}
          </button>
        </form>

        {!hasValidSearchRange && (
          <p className="hint">Pick both dates. The start date must be before the end date.</p>
        )}

        {availableRooms !== null && (
          <form className="form-row" onSubmit={handleCreateBooking}>
            <label>
              Customer
              <select
                value={bookingForm.customerId}
                onChange={(changeEvent) =>
                  updateBookingFormField("customerId", changeEvent.target.value)
                }
                required
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.firstName} {customer.lastName}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Available room
              <select
                value={bookingForm.roomId}
                onChange={(changeEvent) =>
                  updateBookingFormField("roomId", changeEvent.target.value)
                }
                required
              >
                <option value="">Select a room</option>
                {availableRooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.roomNumber} ({room.roomType})
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="button-primary" disabled={!canCreateBooking}>
              Create booking
            </button>
          </form>
        )}
      </div>

      {isLoading ? (
        <LoadingIndicator label="Loading bookings..." />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Customer</th>
              <th>Room</th>
              <th>Start date</th>
              <th>End date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-cell">No bookings yet.</td>
              </tr>
            )}
            {bookings.map((booking) => {
              const isEditing = booking.id === editingBookingId;
              const isReviewing = booking.id === reviewingBookingId;
              // The review service refuses a review while the stay is still running.
              const isReviewable = hasBookingPassed(booking);
              const isAlreadyReviewed = reviewedBookingIds.includes(booking.id);
              return (
                <Fragment key={booking.id}>
                  <tr>
                    <td>{booking.id}</td>
                    <td>{describeCustomer(customers, booking.customerID)}</td>
                    <td>
                      {isEditing ? (
                        <select
                          value={editBookingForm.roomId}
                          onChange={(changeEvent) =>
                            updateEditBookingField("roomId", changeEvent.target.value)
                          }
                        >
                          {rooms.map((room) => (
                            <option key={room.id} value={room.id}>
                              {room.roomNumber} ({room.roomType})
                            </option>
                          ))}
                        </select>
                      ) : (
                        booking.room ? booking.room.roomNumber + " (" + booking.room.roomType + ")" : "-"
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editBookingForm.startDate}
                          onChange={(changeEvent) =>
                            updateEditBookingField("startDate", changeEvent.target.value)
                          }
                        />
                      ) : (
                        booking.startDate
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editBookingForm.endDate}
                          onChange={(changeEvent) =>
                            updateEditBookingField("endDate", changeEvent.target.value)
                          }
                        />
                      ) : (
                        booking.endDate
                      )}
                    </td>
                    <td className="actions-cell">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            className="button-primary"
                            onClick={() => handleSaveBooking(booking.id)}
                          >
                            Save
                          </button>
                          <button type="button" onClick={cancelEditingBooking}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => startEditingBooking(booking)}>
                            Edit
                          </button>
                          <button
                            type="button"
                            className="button-danger"
                            onClick={() => handleDeleteBooking(booking)}
                          >
                            Delete
                          </button>
                          {isReviewable && isAlreadyReviewed && (
                            <span className="reviewed-tag">Reviewed</span>
                          )}
                          {isReviewable && !isAlreadyReviewed && (
                            <button
                              type="button"
                              onClick={() =>
                                isReviewing
                                  ? cancelReviewingBooking()
                                  : startReviewingBooking(booking)
                              }
                            >
                              Review
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>

                  {isReviewing && (
                    <tr className="expanded-row">
                      <td colSpan={6}>
                        <form
                          className="form-row review-form"
                          onSubmit={(submitEvent) => handleSubmitReview(submitEvent, booking)}
                        >
                          <label>
                            Rating
                            <select
                              value={reviewForm.rating}
                              onChange={(changeEvent) =>
                                updateReviewField("rating", changeEvent.target.value)
                              }
                            >
                              {RATING_VALUES.map((ratingValue) => (
                                <option key={ratingValue} value={ratingValue}>
                                  {ratingValue}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="review-comment-field">
                            Comment
                            <textarea
                              rows={2}
                              maxLength={1000}
                              value={reviewForm.comment}
                              onChange={(changeEvent) =>
                                updateReviewField("comment", changeEvent.target.value)
                              }
                              placeholder="How was the stay?"
                            />
                          </label>
                          <button type="submit" className="button-primary" disabled={isSavingReview}>
                            {isSavingReview ? "Saving..." : "Submit review"}
                          </button>
                          <button type="button" onClick={cancelReviewingBooking}>Cancel</button>
                        </form>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
