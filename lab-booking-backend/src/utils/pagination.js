/**
 * Pagination utilities for list endpoints.
 *
 * Supports limit/offset pagination with Link headers
 * (RFC 5988) for machine-readable navigation.
 */

/**
 * Parse limit & offset from query string with sensible defaults.
 */
export function parsePagination(query) {
  let limit = parseInt(query.limit, 10);
  let offset = parseInt(query.offset, 10);

  if (Number.isNaN(limit) || limit < 1) limit = 20;
  if (Number.isNaN(offset) || offset < 0) offset = 0;
  if (limit > 100) limit = 100;

  return { limit, offset };
}

/**
 * Build Link headers for pagination.
 * Returns a string suitable for the `Link` response header.
 */
export function buildLinkHeaders(baseUrl, queryParams, total, limit, offset) {
  const links = [];
  const url = new URL(baseUrl);

  // Copy existing query params
  if (queryParams) {
    for (const [k, v] of Object.entries(queryParams)) {
      if (k !== 'limit' && k !== 'offset') {
        url.searchParams.set(k, v);
      }
    }
  }

  // First page
  url.searchParams.set('limit', limit);
  url.searchParams.set('offset', 0);
  links.push(`<${url.toString()}>; rel="first"`);

  // Previous page
  if (offset > 0) {
    const prevOffset = Math.max(0, offset - limit);
    url.searchParams.set('offset', prevOffset);
    links.push(`<${url.toString()}>; rel="prev"`);
  }

  // Next page
  if (offset + limit < total) {
    const nextOffset = offset + limit;
    url.searchParams.set('offset', nextOffset);
    links.push(`<${url.toString()}>; rel="next"`);
  }

  // Last page
  const lastOffset = Math.max(0, Math.ceil(total / limit) * limit - limit);
  url.searchParams.set('offset', lastOffset);
  links.push(`<${url.toString()}>; rel="last"`);

  return links.join(', ');
}
