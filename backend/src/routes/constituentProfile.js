const express = require('express');
const db = require('../db/schema');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/constituent/profile
router.get('/profile', requireAuth(['constituent']), (req, res) => {
  const constituent = db.prepare('SELECT id, email, zip_code, interest_tags, created_at FROM constituents WHERE id = ?').get(req.user.id);
  if (!constituent) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Profile not found.' } });
  res.json({ ...constituent, interest_tags: JSON.parse(constituent.interest_tags || '[]') });
});

// PUT /api/constituent/profile
router.put('/profile', requireAuth(['constituent']), (req, res) => {
  const { zip_code, interest_tags } = req.body;
  db.prepare('UPDATE constituents SET zip_code = COALESCE(?, zip_code), interest_tags = COALESCE(?, interest_tags) WHERE id = ?')
    .run(zip_code || null, interest_tags ? JSON.stringify(interest_tags) : null, req.user.id);
  res.json({ success: true });
});

module.exports = router;
