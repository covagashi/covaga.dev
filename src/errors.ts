/**
 * Error carrying an HTTP status code, thrown by services and translated into
 * a response by the router.
 */
export class HttpError extends Error {
  /** HTTP status code to return to the client. */
  readonly status: number;

  /**
   * @param status - HTTP status code (e.g. 401, 404).
   * @param message - Client-safe error message.
   */
  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}
