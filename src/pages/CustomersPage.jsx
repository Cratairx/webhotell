import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { deleteCustomer, fetchAllCustomers } from "../api/customerApi.js";
import StatusMessage from "../components/StatusMessage.jsx";
import LoadingIndicator from "../components/LoadingIndicator.jsx";

export default function CustomersPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  // The form pages report their result by navigating back with a feedback object.
  // It is cleared from the history entry so a refresh does not show it again.
  useEffect(() => {
    if (location.state && location.state.feedback) {
      setFeedback(location.state.feedback);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  async function loadCustomers() {
    setIsLoading(true);
    try {
      const loadedCustomers = await fetchAllCustomers();
      setCustomers(loadedCustomers ?? []);
    } catch (error) {
      setFeedback({ type: "error", text: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteCustomer(customer) {
    const isConfirmed = window.confirm(
      "Delete " + customer.firstName + " " + customer.lastName + "?"
    );
    if (!isConfirmed) {
      return;
    }
    try {
      await deleteCustomer(customer.id);
      setFeedback({ type: "success", text: "Customer deleted." });
      await loadCustomers();
    } catch (error) {
      const message =
        error.statusCode === 409
          ? "The customer could not be deleted. They still have bookings, or the booking service is unreachable."
          : error.message;
      setFeedback({ type: "error", text: message });
    }
  }

  return (
    <section>
      <div className="page-header">
        <h2>Customers</h2>
        <Link to="/customers/new" className="button-link">Add customer</Link>
      </div>

      <StatusMessage feedback={feedback} onDismiss={() => setFeedback(null)} />

      {isLoading ? (
        <LoadingIndicator label="Loading customers..." />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>First name</th>
              <th>Last name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="empty-cell">No customers yet.</td>
              </tr>
            )}
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.id}</td>
                <td>{customer.firstName}</td>
                <td>{customer.lastName}</td>
                <td>{customer.email}</td>
                <td className="actions-cell">
                  <Link to={"/customers/" + customer.id + "/edit"} className="button-link">
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="button-danger"
                    onClick={() => handleDeleteCustomer(customer)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
