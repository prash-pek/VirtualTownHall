const express = require('express');
const multer = require('multer');
const { randomUUID } = require('crypto');
const crypto = require('crypto');
const db = require('../db/schema');
const { requireAuth } = require('../middleware/auth');
const { logAudit } = require('../utils/audit');
const { extractText } = require('../services/fileProcessor');
const StorageService = require('../services/storage');
const { computeAlignmentScore } = require('../services/alignment');

const router = express.Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

// GET /api/candidate/profile
router.get('/profile', requireAuth(['candidate']), (req, res) => {
  const candidate = db.prepare('SELECT * FROM candidates WHERE id = ?').get(req.user.candidateId);
  if (!candidate) return res.status(404).json({ error: { code: 'CANDIDATE_NOT_FOUND', message: 'Candidate not found.' } });
  const { password_hash, ...safe } = candidate;
  res.json(safe);
});

// PUT /api/candidate/profile
router.put('/profile', requireAuth(['candidate']), (req, res) => {
  const { name, office, district, zip_codes, party, bio, donation_url } = req.body;
  db.prepare(`
    UPDATE candidates SET name = COALESCE(?, name), office = COALESCE(?, office),
    district = COALESCE(?, district), zip_codes = COALESCE(?, zip_codes),
    party = COALESCE(?, party), bio = COALESCE(?, bio),
    donation_url = COALESCE(?, donation_url), updated_at = datetime('now')
    WHERE id = ?
  `).run(name, office, district, zip_codes ? JSON.stringify(zip_codes) : null, party, bio, donation_url, req.user.candidateId);
  res.json({ success: true });
});

// PUT /api/candidate/persona
router.put('/persona', requireAuth(['candidate']), (req, res) => {
  const candidateId = req.user.candidateId;
  db.prepare(`UPDATE candidates SET persona_config = ?, updated_at = datetime('now') WHERE id = ?`)
    .run(JSON.stringify(req.body), candidateId);
  logAudit(candidateId, 'persona_updated', candidateId, req.body);
  res.json({ success: true });
});

// POST /api/candidate/context
router.post('/context', requireAuth(['candidate']), upload.single('file'), async (req, res) => {
  const candidateId = req.user.candidateId;

  try {
    let contentText, originalFilename, contentType;

    if (req.file) {
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(415).json({ error: { code: 'CONTEXT_UNSUPPORTED_TYPE', message: 'Only PDF, DOCX, and TXT files are supported.' } });
      }
      contentText = await extractText(req.file.buffer, req.file.mimetype);
      originalFilename = req.file.originalname;
      contentType = 'document';
      const ext = req.file.originalname.split('.').pop();
      StorageService.save(candidateId, req.file.buffer, `${randomUUID()}.${ext}`);
    } else {
      contentText = req.body.content_text;
      contentType = 'manual';
      if (!contentText) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'content_text required for manual entry.' } });
    }

    const topic_tags = req.body.topic_tags ? JSON.parse(req.body.topic_tags) : [];
    const contentHash = crypto.createHash('sha256').update(contentText).digest('hex');
    const id = randomUUID();
    const prev = db.prepare('SELECT alignment_score FROM candidates WHERE id = ?').get(candidateId);

    db.prepare(`
      INSERT INTO candidate_contexts (id, candidate_id, content_type, original_filename, content_text, topic_tags, content_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, candidateId, contentType, originalFilename || null, contentText, JSON.stringify(topic_tags), contentHash);

    logAudit(candidateId, 'context_added', candidateId, { id, contentType, originalFilename }, contentText);

    // Trigger alignment score recomputation asynchronously
    computeAlignmentScore(candidateId).catch(console.error);

    res.status(201).json({
      id, content_type: contentType, original_filename: originalFilename,
      content_hash: contentHash, topic_tags,
      created_at: new Date().toISOString(),
      alignment_score_update: { status: 'processing', previous_score: prev?.alignment_score }
    });
  } catch (err) {
    console.error(err);
    res.status(422).json({ error: { code: 'CONTEXT_UPLOAD_FAILED', message: err.message } });
  }
});

// GET /api/candidate/context
router.get('/context', requireAuth(['candidate']), (req, res) => {
  const contexts = db.prepare('SELECT * FROM candidate_contexts WHERE candidate_id = ? AND is_active = 1').all(req.user.candidateId);
  res.json(contexts);
});

// DELETE /api/candidate/context/:id
router.delete('/context/:id', requireAuth(['candidate']), (req, res) => {
  const candidateId = req.user.candidateId;
  db.prepare('UPDATE candidate_contexts SET is_active = 0 WHERE id = ? AND candidate_id = ?').run(req.params.id, candidateId);
  logAudit(candidateId, 'context_deleted', candidateId, { contextId: req.params.id });
  computeAlignmentScore(candidateId).catch(console.error);
  res.json({ success: true });
});

// POST /api/candidate/blocked-topics
router.post('/blocked-topics', requireAuth(['candidate']), (req, res) => {
  const candidateId = req.user.candidateId;
  const { topic, redirect_message, redirect_url } = req.body;
  if (!topic) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'topic required.' } });
  const id = randomUUID();
  db.prepare('INSERT INTO blocked_topics (id, candidate_id, topic, redirect_message, redirect_url) VALUES (?, ?, ?, ?, ?)').run(id, candidateId, topic, redirect_message || null, redirect_url || null);
  logAudit(candidateId, 'topic_blocked', candidateId, { topic });
  res.status(201).json({ id, topic, redirect_message, redirect_url });
});

// PUT /api/candidate/blocked-topics/:id
router.put('/blocked-topics/:id', requireAuth(['candidate']), (req, res) => {
  const { topic, redirect_message, redirect_url, is_active } = req.body;
  db.prepare('UPDATE blocked_topics SET topic = COALESCE(?, topic), redirect_message = COALESCE(?, redirect_message), redirect_url = COALESCE(?, redirect_url), is_active = COALESCE(?, is_active) WHERE id = ? AND candidate_id = ?')
    .run(topic, redirect_message, redirect_url, is_active, req.params.id, req.user.candidateId);
  res.json({ success: true });
});

// DELETE /api/candidate/blocked-topics/:id
router.delete('/blocked-topics/:id', requireAuth(['candidate']), (req, res) => {
  const candidateId = req.user.candidateId;
  const bt = db.prepare('SELECT topic FROM blocked_topics WHERE id = ? AND candidate_id = ?').get(req.params.id, candidateId);
  if (bt) {
    db.prepare('DELETE FROM blocked_topics WHERE id = ? AND candidate_id = ?').run(req.params.id, candidateId);
    logAudit(candidateId, 'topic_unblocked', candidateId, { topic: bt.topic });
  }
  res.json({ success: true });
});

// POST /api/candidate/kill-switch (global pause or per-topic)
router.post('/kill-switch', requireAuth(['candidate']), (req, res) => {
  const candidateId = req.user.candidateId;
  const { global, topic_id } = req.body;
  if (global) {
    db.prepare('UPDATE candidates SET is_paused = 1, updated_at = datetime(\'now\') WHERE id = ?').run(candidateId);
    logAudit(candidateId, 'global_pause', candidateId, {});
  } else if (topic_id) {
    db.prepare('UPDATE blocked_topics SET is_active = 1 WHERE id = ? AND candidate_id = ?').run(topic_id, candidateId);
    logAudit(candidateId, 'kill_switch_activated', candidateId, { topic_id });
  }
  res.json({ success: true });
});

// DELETE /api/candidate/kill-switch
router.delete('/kill-switch', requireAuth(['candidate']), (req, res) => {
  const candidateId = req.user.candidateId;
  db.prepare('UPDATE candidates SET is_paused = 0, updated_at = datetime(\'now\') WHERE id = ?').run(candidateId);
  logAudit(candidateId, 'global_resume', candidateId, {});
  res.json({ success: true });
});

// GET /api/candidate/analytics
router.get('/analytics', requireAuth(['candidate']), (req, res) => {
  const candidateId = req.user.candidateId;
  const convos = db.prepare('SELECT * FROM conversations WHERE candidate_id = ?').all(candidateId);

  const total = convos.length;
  const authenticated = convos.filter(c => !c.is_anonymous).length;
  const anonymous = total - authenticated;
  const uniqueConstituents = new Set(convos.filter(c => c.constituent_id).map(c => c.constituent_id)).size;
  const avgMessages = total ? (convos.reduce((s, c) => s + c.message_count, 0) / total).toFixed(1) : 0;

  const topicCounts = {};
  convos.forEach(c => {
    const tags = JSON.parse(c.topic_tags || '[]');
    tags.forEach(t => { topicCounts[t] = (topicCounts[t] || 0) + 1; });
  });

  const topQuestions = Object.entries(topicCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([topic, count]) => ({ topic, count }));

  // Build 14-day daily trend
  const daily_trend = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const count = convos.filter(c => c.created_at && c.created_at.startsWith(dateStr)).length;
    daily_trend.push({ date: dateStr, count });
  }

  // Completion rate (conversations with ended_at)
  const completed = convos.filter(c => c.ended_at).length;
  const completion_rate = total ? Math.round((completed / total) * 100) : 0;

  // Average engagement: avg messages for completed convos
  const avgEngagement = completed
    ? (convos.filter(c => c.ended_at).reduce((s, c) => s + c.message_count, 0) / completed).toFixed(1)
    : 0;

  res.json({
    total_conversations: total,
    authenticated_conversations: authenticated,
    anonymous_conversations: anonymous,
    unique_constituents: uniqueConstituents,
    avg_messages_per_conversation: parseFloat(avgMessages),
    avg_engagement: parseFloat(avgEngagement),
    completion_rate,
    top_questions: topQuestions,
    daily_trend,
    period: 'all_time',
  });
});

// GET /api/candidate/audit-log
router.get('/audit-log', requireAuth(['candidate']), (req, res) => {
  const logs = db.prepare('SELECT * FROM audit_logs WHERE candidate_id = ? ORDER BY created_at DESC').all(req.user.candidateId);
  res.json(logs);
});

module.exports = router;
