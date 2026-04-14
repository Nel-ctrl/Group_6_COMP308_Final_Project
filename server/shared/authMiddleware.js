const jwt = require('jsonwebtoken');

/**
 * Extract and verify the JWT from the request headers.
 * Returns the decoded user payload, or null if invalid/missing.
 *
 * This is used by every microservice to identify the logged-in user.
 * The API Gateway forwards the Authorization header to each service.
 */
function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  // Expected format: "Bearer <token>"
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    return decoded; // { id, email, role }
  } catch (error) {
    return null;
  }
}

/**
 * Build the GraphQL context for each request.
 * This function is passed to Apollo Server's `context` option.
 */
function buildContext({ req }) {
  const user = verifyToken(req);
  return { user, req };
}

module.exports = { verifyToken, buildContext };
