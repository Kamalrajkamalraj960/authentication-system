import { ZodError } from 'zod';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Validation middleware factory. Parses req against a Zod schema describing
 * { body, query, params }. On success, the (coerced/sanitized) values are
 * written back onto req so downstream handlers receive clean data.
 */
const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (parsed.body) req.body = parsed.body;
    // req.query/req.params can be read-only getters in some Express versions;
    // assign defensively.
    if (parsed.query) Object.defineProperty(req, 'query', { value: parsed.query, configurable: true });
    if (parsed.params) req.params = parsed.params;

    return next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.errors.map((e) => ({
        field: e.path.filter((p) => p !== 'body' && p !== 'query' && p !== 'params').join('.'),
        message: e.message,
      }));
      return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
        success: false,
        message: 'Validation failed',
        data: { errors },
      });
    }
    return next(err);
  }
};

export default validate;
