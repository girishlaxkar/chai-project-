//Think of ApiError as a custom envelope for your backend errors —
//it wraps the raw error in a structured format so your API responses
//are clean, predictable, and easy to debug.

class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };

// ---------------- STACK HANDLING IN ApiError ----------------

// Every Error object in JS has a "stack" property
// - It's a string showing the call path (functions + line numbers)
// - Example output:
//   ApiError: Something went wrong
//       at someFunction (file.js:10:5)
//       at anotherFunction (file.js:20:3)

// In ApiError constructor:
// if (stack) {
//   this.stack = stack;
//   // 👉 If a custom stack string is passed in, use it directly.
//   // Example:
//   // new ApiError(400, "Bad Request", [], "Custom stack trace here")
//   // => err.stack === "Custom stack trace here"
// } else {
//   Error.captureStackTrace(this, this.constructor);
//   // 👉 If no custom stack is provided:
//   // - Node.js auto-generates a stack trace
//   // - captureStackTrace attaches the breadcrumb trail of calls
//   // - Excludes the constructor itself for cleaner output
//   // - Helps developers debug by showing where the error originated
// }
