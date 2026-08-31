import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createCustomer, fetchCustomerById, updateCustomer } from "../api/customerApi.js";
import StatusMessage from "../components/StatusMessage.jsx";
import LoadingIndicator from "../components/LoadingIndicator.jsx";

const emptyCustomerForm = { firstName: "", lastName: "", email: "" };

/**
 * Serves both /customers/new and /customers/:customerId/edit.
 * The presence of a customerId in the URL is what puts the page in edit mode.
 */
export default function CustomerFormPage() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const isEditMode = customerId !== undefined;

  const [customerForm, setCustomerForm] = useState(emptyCustomerForm);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (isEditMode) {
      loadCustomer();
    }
  }, [customerId]);

  async function loadCustomer() {
    setIsLoading(true);
    try {
      const loadedCustomer = await fetchCustomerById(customerId);
      setCustomerForm({
        firstName: loadedCustomer.firstName,
        lastName: loadedCustomer.lastName,
        email: loadedCustomer.email
      });
    } catch (error) {
      const message =
        error.statusCode === 404
          ? "There is no customer with id " + customerId + "."
          : error.message;
      setFeedback({ type: "error", text: message });
    } finally {
      setIsLoading(false);
    }
  }

  function updateCustomerField(fieldName, fieldValue) {
    setCustomerForm((previousForm) => ({ ...previousForm, [fieldName]: fieldValue }));
  }

  function returnToList(successText) {
    navigate("/customers", { state: { feedback: { type: "success", text: successText } } });
  }

  async function handleSubmit(submitEvent) {
    submitEvent.preventDefault();
    setIsSaving(true);
    setFeedback(null);
    try {
      if (isEditMode) {
        await updateCustomer(customerId, customerForm);
        returnToList("Customer updated.");
      } else {
        const createdCustomer = await createCustomer(customerForm);
        returnToList("Created " + createdCustomer.firstName + " " + createdCustomer.lastName + ".");
      }
    } catch (error) {
      const message =
        error.statusCode === 400
          ? "The server rejected the customer. All fields are required and the email must be unique."
          : error.message;
      setFeedback({ type: "error", text: message });
      setIsSaving(false);
    }
  }

  const pageTitle = isEditMode ? "Edit customer " + customerId : "New customer";

  return (
    <section>
      <div className="page-header">
        <h2>{pageTitle}</h2>
        <button type="button" onClick={() => navigate("/customers")}>Back to customers</button>
      </div>

      <StatusMessage feedback={feedback} onDismiss={() => setFeedback(null)} />

      {isLoading ? (
        <LoadingIndicator label="Loading customer..." />
      ) : (
        <form className="card form-column" onSubmit={handleSubmit}>
          <label>
            First name
            <input
              type="text"
              value={customerForm.firstName}
              onChange={(changeEvent) =>
                updateCustomerField("firstName", changeEvent.target.value)
              }
              required
              autoFocus
            />
          </label>
          <label>
            Last name
            <input
              type="text"
              value={customerForm.lastName}
              onChange={(changeEvent) =>
                updateCustomerField("lastName", changeEvent.target.value)
              }
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={customerForm.email}
              onChange={(changeEvent) => updateCustomerField("email", changeEvent.target.value)}
              required
            />
          </label>

          <div className="form-actions">
            <button type="submit" className="button-primary" disabled={isSaving}>
              {isSaving ? "Saving..." : isEditMode ? "Save changes" : "Create customer"}
            </button>
            <button type="button" onClick={() => navigate("/customers")} disabled={isSaving}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
