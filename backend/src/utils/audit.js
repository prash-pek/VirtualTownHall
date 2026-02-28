const { randomUUID } = require('crypto');
const crypto = require('crypto');
const db = require('../db/schema');

function logAudit(candidateId, actionType, actorId, details = {}, contentText = null) {
  const lastEntry = db.prepare(
    `SELECT content_hash FROM audit_logs WHERE candidate_id = ? ORDER BY created_at DESC LIMIT 1`
  ).get(candidateId);

  const previousHash = lastEntry ? lastEntry.content_hash : null;
  const contentHash = contentText
    ? crypto.createHash('sha256').update(contentText).digest('hex')
    : crypto.createHash('sha256').update(JSON.stringify(details)).digest('hex');

  db.prepare(`
    INSERT INTO audit_logs (id, candidate_id, action_type, content_hash, previous_hash, details, actor_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(randomUUID(), candidateId, actionType, contentHash, previousHash, JSON.stringify(details), actorId);
}

module.exports = { logAudit };
