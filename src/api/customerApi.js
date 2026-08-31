import { customerServiceRequest, jsonRequestOptions } from "./apiClient.js";

export function fetchAllCustomers() {
  return customerServiceRequest("/api/customers");
}

export function fetchCustomerById(customerId) {
  return customerServiceRequest(`/api/customer/${customerId}`);
}

export function createCustomer(customerPayload) {
  return customerServiceRequest("/api/customer", jsonRequestOptions("POST", customerPayload));
}

// CustomerController maps the update to POST, not PUT.
export function updateCustomer(customerId, customerPayload) {
  return customerServiceRequest(
    `/api/customer/${customerId}`,
    jsonRequestOptions("POST", customerPayload)
  );
}

// Answers 409 when the customer still has bookings.
export function deleteCustomer(customerId) {
  return customerServiceRequest(`/api/customer/${customerId}/delete`, { method: "POST" });
}
