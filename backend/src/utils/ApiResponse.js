/**
 * Standard success envelope so every endpoint returns a predictable shape:
 *   { success, message, data }
 * The frontend axios layer relies on this contract.
 */
export default class ApiResponse {
  constructor(res) {
    this.res = res;
  }

  static from(res) {
    return new ApiResponse(res);
  }

  send(statusCode, message, data = null) {
    return this.res.status(statusCode).json({
      success: statusCode < 400,
      message,
      data,
    });
  }
}

export const sendSuccess = (res, statusCode, message, data = null) =>
  res.status(statusCode).json({ success: true, message, data });
