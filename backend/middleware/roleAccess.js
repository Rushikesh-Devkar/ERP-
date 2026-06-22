// Role access middleware (simple RBAC)
// Usage:
//   const { requireRole } = require('./roleAccess');
//   router.get('/x', authMiddleware, requireRole(['admin','principal']), handler)

const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role) return res.status(401).json({ message: 'Unauthorized' });
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

module.exports = { requireRole };

