const jwt = require('jsonwebtoken');

function requireAuth(roles = []) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: { code: 'AUTH_UNAUTHORIZED', message: 'Authentication required.' } });
    }
    const token = header.slice(7);
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (roles.length && !roles.includes(payload.role)) {
        return res.status(403).json({ error: { code: 'AUTH_UNAUTHORIZED', message: 'Insufficient permissions.' } });
      }
      req.user = payload;
      next();
    } catch (err) {
      const code = err.name === 'TokenExpiredError' ? 'AUTH_TOKEN_EXPIRED' : 'AUTH_UNAUTHORIZED';
      return res.status(401).json({ error: { code, message: 'Invalid or expired token.' } });
    }
  };
}

module.exports = { requireAuth };
