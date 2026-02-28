const express = require('express');
const { randomUUID } = require('crypto');
const db = require('../db/schema');
const { requireAuth } = require('../middleware/auth');
const { chat, generateSummary, extractTopics } = require('../services/ai');

const router = express.Router();

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    const jwt = require('jsonwebtoken');
    try {
      req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    } catch {}
  }
  next();
}

// POST /api/conversations
router.post('/', optionalAuth, (req, res) => {
  const { candidate_id } = req.body;
  if (!candidate_id) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'candidate_id required.' } });

  const candidate = db.prepare('SELECT id, is_paused FROM candidates WHERE id = ?').get(candidate_id);
  if (!candidate) return res.status(404).json({ error: { code: 'CANDIDATE_NOT_FOUND', message: 'Candidate not found.' } });
  if (candidate.is_paused) return res.status(503).json({ error: { code: 'CANDIDATE_PAUSED', message: "This candidate's AI representative is currently unavailable." } });

  const id = randomUUID();
  const constituentId = req.user?.role === 'constituent' ? req.user.id : null;
  const isAnonymous = constituentId ? 0 : 1;

  db.prepare('INSERT INTO conversations (id, candidate_id, constituent_id, is_anonymous) VALUES (?, ?, ?, ?)').run(id, candidate_id, constituentId, isAnonymous);
  res.status(201).json({ id, candidate_id, is_anonymous: isAnonymous });
});

// POST /api/conversations/:id/messages
router.post('/:id/messages', optionalAuth, async (req, res) => {
  const conversation = db.prepare('SELECT * FROM conversations WHERE id = ?').get(req.params.id);
  if (!conversation) return res.status(404).json({ error: { code: 'CONVERSATION_NOT_FOUND', message: 'Conversation not found.' } });

  const { content } = req.body;
  if (!content) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'content required.' } });

  const messages = JSON.parse(conversation.messages || '[]');
  messages.push({ role: 'user', content, timestamp: new Date().toISOString() });

  try {
    const responseText = await chat(conversation.candidate_id, messages);
    messages.push({ role: 'assistant', content: responseText, timestamp: new Date().toISOString() });

    db.prepare(`UPDATE conversations SET messages = ?, message_count = ?, updated_at = datetime('now') WHERE id = ?`).run(JSON.stringify(messages), messages.length, req.params.id);

    res.json({
      id: randomUUID(),
      role: 'assistant',
      content: responseText,
      is_blocked_topic: false,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    if (err.code === 'CANDIDATE_PAUSED') {
      return res.status(503).json({ error: { code: 'CANDIDATE_PAUSED', message: "This candidate's AI representative is currently unavailable." } });
    }
    console.error(err);
    res.status(503).json({ error: { code: 'AI_SERVICE_UNAVAILABLE', message: 'AI service temporarily unavailable. Please try again.' } });
  }
});

// POST /api/conversations/:id/end
router.post('/:id/end', optionalAuth, async (req, res) => {
  const conversation = db.prepare('SELECT * FROM conversations WHERE id = ?').get(req.params.id);
  if (!conversation) return res.status(404).json({ error: { code: 'CONVERSATION_NOT_FOUND', message: 'Conversation not found.' } });

  const messages = JSON.parse(conversation.messages || '[]');
  if (!messages.length) return res.json({ summary: null });

  const candidate = db.prepare('SELECT name FROM candidates WHERE id = ?').get(conversation.candidate_id);

  try {
    const [summary, topicData] = await Promise.all([
      generateSummary(candidate.name, messages),
      extractTopics(messages)
    ]);

    db.prepare(`UPDATE conversations SET summary = ?, topic_tags = ?, ended_at = datetime('now') WHERE id = ?`)
      .run(summary, JSON.stringify(topicData.topics || []), req.params.id);

    res.json({ summary, topics: topicData.topics, questions: topicData.questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { code: 'AI_SERVICE_UNAVAILABLE', message: 'Could not generate summary.' } });
  }
});

// GET /api/conversations/:id
router.get('/:id', optionalAuth, (req, res) => {
  const conversation = db.prepare('SELECT * FROM conversations WHERE id = ?').get(req.params.id);
  if (!conversation) return res.status(404).json({ error: { code: 'CONVERSATION_NOT_FOUND', message: 'Conversation not found.' } });
  res.json({ ...conversation, messages: JSON.parse(conversation.messages || '[]') });
});

module.exports = router;
