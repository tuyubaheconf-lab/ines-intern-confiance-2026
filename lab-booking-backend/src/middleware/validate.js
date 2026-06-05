/**
 * Zod validation middleware.
 * Validates the request body, query, or params against a Zod schema.
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const fieldErrors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      return res.status(400).json({
        success: false,
        data: null,
        error: { message: 'Validation failed', statusCode: 400, details: fieldErrors },
        meta: null,
      });
    }

    // Replace with parsed (and coerced) data
    req[source] = result.data;
    next();
  };
}
