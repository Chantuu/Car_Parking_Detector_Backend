/**
 * This function is used to properly format response object for unified response
 * structure across endpoints.
 *
 * @param statusMessage - Message of the response status.
 * @param data - Desired data to be returned. (Optional)
 * @param message - Desired message to be returned. (Optional)
 * @returns
 */
export function successResponse(
  statusMessage: string,
  data?: any,
  message?: string,
): { status: string; data?: any; message?: string } {
  return {
    status: statusMessage,
    data,
    message,
  };
}
