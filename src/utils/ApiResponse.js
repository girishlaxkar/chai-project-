// ApiResponse class: wraps successful API responses in a clean, consistent format
class ApiResponse {
  constructor(
    statusCode,           // HTTP status code (e.g., 200, 201, 204)
    data,                 // Actual payload/data to return to the client
    message = "Success"   // Optional message, defaults to "Success"
  ) {
    this.statusCode = statusCode; // Store the HTTP status code
    this.data = data;             // Attach the response data
    this.message = message;       // Human-readable success message

    // Determine success based on status code
    // Any code < 400 is considered a success (200–399)
    this.success = statusCode < 400;
  }
}