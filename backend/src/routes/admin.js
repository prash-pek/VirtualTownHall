const express = require('express');
const db = require('../db/schema');
const { requireAuth } = require('../middleware/auth');
const { logAudit } = require('../utils/audit');

const router = express.Router();

// GET /api/admin/candidates
router.get('/candidates', requireAuth(['admin']), (req, res) => {
  const candidates = db.prepare('SELECT * FROM candidates').all().map(c => {
    const { password_hash, ...safe } = c;
    return safe;
  });
  res.json(candidates);
});

// PUT /api/admin/candidates/:id/verify
router.put('/candidates/:id/verify', requireAuth(['admin']), (req, res) => {
  db.prepare("UPDATE candidates SET is_verified = 1, updated_at = datetime('now') WHERE id = ?").run(req.params.id);
  logAudit(req.params.id, 'verification_granted', req.user.id, {});
  res.json({ success: true });
});

// DELETE /api/admin/candidates/:id/verify
router.delete('/candidates/:id/verify', requireAuth(['admin']), (req, res) => {
  db.prepare("UPDATE candidates SET is_verified = 0, updated_at = datetime('now') WHERE id = ?").run(req.params.id);
  logAudit(req.params.id, 'verification_revoked', req.user.id, {});
  res.json({ success: true });
});

module.exports = router;
