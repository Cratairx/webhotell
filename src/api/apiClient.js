const CUSTOMER_SERVICE_BASE_URL =
  import.meta.env.VITE_CUSTOMER_SERVICE_URL ?? "http://localhost:8080";
const BOOKING_SERVICE_BASE_URL =
  import.meta.env.VITE_BOOKING_SERVICE_URL ?? "http://localhost:8081";
const REVIEW_SERVICE_BASE_URL =
  import.meta.env.VITE_REVIEW_SERVICE_URL ?? "http://localhost:8082";

/** Error carrying the HTTP status, so pages can react to 409 differently than 500. */
export class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

/**
 * The services answer with JSON, plain text ("Room unavailable or invalid customer")
 * or an empty body (204 / 201), so every shape has to be handled.
 */
function parseResponseBody(rawBody) {
  if (rawBody === "") {
    return null;
  }
  try {
    return JSON.parse(rawBody);
  } catch (parseError) {
    return rawBody;
  }
}

function describeFailure(statusCode, parsedBody) {
  if (typeof parsedBody === "string" && parsedBody.trim() !== "") {
    return parsedBody;
  }
  if (parsedBody && typeof parsedBody.message === "string" && parsedBody.message !== "") {
    return parsedBody.message;
  }
  if (statusCode === 400) {
    return "The server rejected the request (400). Check the values you entered.";
  }
  if (statusCode === 404) {
    return "Not found (404).";
  }
  if (statusCode === 409) {
    return "Conflict (409). The operation was refused.";
  }
  return `The request failed with status ${statusCode}.`;
}

async function sendRequest(baseUrl, path, options = {}) {
  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, options);
  } catch (networkError) {
    throw new ApiError(
      `Could not reach ${baseUrl}. Is the service running?`,
      0
    );
  }

  const rawBody = await response.text();
  const parsedBody = parseResponseBody(rawBody);

  if (!response.ok) {
    throw new ApiError(describeFailure(response.status, parsedBody), response.status);
  }
  return parsedBody;
}

/** Builds "?a=1&b=2", skipping empty values. Both services take query params, not JSON, for most writes. */
export function buildQueryString(parameters) {
  const searchParameters = new URLSearchParams();
  Object.entries(parameters).forEach(([parameterName, parameterValue]) => {
    if (parameterValue !== undefined && parameterValue !== null && parameterValue !== "") {
      searchParameters.append(parameterName, parameterValue);
    }
  });
  const queryString = searchParameters.toString();
  return queryString === "" ? "" : `?${queryString}`;
}

export function jsonRequestOptions(method, payload) {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  };
}

export function customerServiceRequest(path, options) {
  return sendRequest(CUSTOMER_SERVICE_BASE_URL, path, options);
}

export function bookingServiceRequest(path, options) {
  return sendRequest(BOOKING_SERVICE_BASE_URL, path, options);
}

export function reviewServiceRequest(path, options) {
  return sendRequest(REVIEW_SERVICE_BASE_URL, path, options);
}
