const express = require('express');
const db = require('../db/schema');

const router = express.Router();

// GET /api/candidates?zip=xxxxx&topics=a,b
router.get('/', (req, res) => {
  const { zip, topics } = req.query;
  if (!zip) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'zip query parameter required.' } });

  let candidates = db.prepare('SELECT * FROM candidates WHERE is_paused = 0').all()
    .filter(c => {
      const zips = JSON.parse(c.zip_codes || '[]');
      return zips.includes(zip);
    });

  if (topics) {
    const topicList = topics.split(',').map(t => t.trim());
    candidates = candidates.filter(c => {
      const contexts = db.prepare('SELECT topic_tags FROM candidate_contexts WHERE candidate_id = ? AND is_active = 1').all(c.id);
      const candidateTopics = contexts.flatMap(ctx => JSON.parse(ctx.topic_tags || '[]'));
      return topicList.some(t => candidateTopics.includes(t));
    });
  }

  const results = candidates.map(c => {
    const { password_hash, ...safe } = c;
    return safe;
  });

  res.json(results);
});

// GET /api/candidates/:id/profile
router.get('/:id/profile', (req, res) => {
  const candidate = db.prepare('SELECT * FROM candidates WHERE id = ?').get(req.params.id);
  if (!candidate) return res.status(404).json({ error: { code: 'CANDIDATE_NOT_FOUND', message: 'Candidate not found.' } });
  const { password_hash, ...safe } = candidate;

  const contexts = db.prepare('SELECT id, content_type, original_filename, topic_tags, created_at FROM candidate_contexts WHERE candidate_id = ? AND is_active = 1').all(req.params.id);
  const blockedTopics = db.prepare('SELECT topic FROM blocked_topics WHERE candidate_id = ? AND is_active = 1').all(req.params.id).map(t => t.topic);

  res.json({ ...safe, contexts, blocked_topics: blockedTopics });
});

// GET /api/candidates/:id/audit
router.get('/:id/audit', (req, res) => {
  const logs = db.prepare('SELECT action_type, created_at, details FROM audit_logs WHERE candidate_id = ? ORDER BY created_at DESC').all(req.params.id);
  const publicLog = logs.map(l => {
    const details = JSON.parse(l.details || '{}');
    let summary = l.action_type.replace(/_/g, ' ');
    if (details.originalFilename) summary = `Added document: ${details.originalFilename}`;
    if (details.topic) summary = `Blocked topic: ${details.topic}`;
    return { action: l.action_type, timestamp: l.created_at, summary };
  });
  res.json(publicLog);
});

module.exports = router;
