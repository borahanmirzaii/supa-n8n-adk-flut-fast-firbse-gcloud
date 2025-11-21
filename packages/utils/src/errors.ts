/**
 * Custom error classes
 */

/**
 * Base application error
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string = "INTERNAL_ERROR",
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public field?: string,
    details?: Record<string, unknown>
  ) {
    super(message, "VALIDATION_ERROR", 400, details);
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required", details?: Record<string, unknown>) {
    super(message, "UNAUTHORIZED", 401, details);
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends AppError {
  constructor(message: string = "Access denied", details?: Record<string, unknown>) {
    super(message, "FORBIDDEN", 403, details);
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string, details?: Record<string, unknown>) {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
    super(message, "NOT_FOUND", 404, details);
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends AppError {
  constructor(
    message: string = "Rate limit exceeded",
    public retryAfter?: number,
    details?: Record<string, unknown>
  ) {
    super(message, "RATE_LIMIT_EXCEEDED", 429, details);
  }
}

/**
 * Network error
 */
export class NetworkError extends AppError {
  constructor(message: string = "Network request failed", details?: Record<string, unknown>) {
    super(message, "NETWORK_ERROR", 0, details);
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends AppError {
  constructor(message: string = "Request timeout", details?: Record<string, unknown>) {
    super(message, "TIMEOUT_ERROR", 408, details);
  }
}



