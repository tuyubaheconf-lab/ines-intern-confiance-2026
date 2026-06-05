/**
 * Standardized response envelope.
 *
 * Every API response follows: { success, data, error, meta }
 *
 * - success: boolean
 * - data:    the payload (null on error)
 * - error:   error details (null on success)
 * - meta:    metadata such as pagination info, timestamps
 */

/**
 * Success response
 */
export function success(data = null, meta = null) {
  return { success: true, data, error: null, meta };
}

/**
 * Error response
 */
export function error(message, statusCode = 500, details = null) {
  return { success: false, data: null, error: { message, statusCode, details }, meta: null };
}

/**
 * Paginated success response
 */
export function paginated(data, pagination) {
  return {
    success: true,
    data,
    error: null,
    meta: {
      pagination: {
        limit: pagination.limit,
        offset: pagination.offset,
        total: pagination.total,
        hasMore: pagination.offset + pagination.limit < pagination.total,
      },
    },
  };
}
