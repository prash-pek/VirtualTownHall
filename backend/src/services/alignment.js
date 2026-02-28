const Anthropic = require('@anthropic-ai/sdk');
const db = require('../db/schema');
const { logAudit } = require('../utils/audit');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function computeAlignmentScore(candidateId) {
  const candidate = db.prepare('SELECT * FROM candidates WHERE id = ?').get(candidateId);
  if (!candidate) return;

  const contexts = db.prepare(
    'SELECT content_text FROM candidate_contexts WHERE candidate_id = ? AND is_active = 1'
  ).all(candidateId);

  if (!contexts.length) return;

  const contextText = contexts.map(c => c.content_text).join('\n\n---\n\n');

  // Search for public record using Claude's web search tool
  let publicRecord = '';
  try {
    const searchResponse = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{
        role: 'user',
        content: `Search for recent public statements, interviews, and positions by ${candidate.name} who is running for ${candidate.office} in ${candidate.district}. Collect key policy positions from at least 3 different sources.`
      }]
    });

    const textBlocks = searchResponse.content.filter(b => b.type === 'text');
    publicRecord = textBlocks.map(b => b.text).join('\n');
  } catch (err) {
    console.error('Web search for alignment score failed:', err.message);
    publicRecord = 'No public record data available — web search unavailable.';
  }

  const comparisonResponse = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Analyze the alignment between a political candidate's publicly available statements and their uploaded platform context.

PUBLIC STATEMENTS AND RECORD:
${publicRecord}

CANDIDATE'S UPLOADED CONTEXT:
${contextText}

Evaluate on these dimensions:
1. Policy positions: Do uploaded positions match public statements?
2. Tone and emphasis: Are priorities presented consistently?
3. Omissions: Are significant public positions missing from context?
4. Contradictions: Are there direct conflicts between public record and uploaded context?

Respond in JSON only:
{
  "score": <0-100 integer>,
  "rationale": "<2-3 sentence explanation>",
  "discrepancies": [
    {"topic": "...", "public_position": "...", "uploaded_position": "...", "severity": "low|medium|high"}
  ]
}`
    }]
  });

  let result;
  try {
    result = JSON.parse(comparisonResponse.content[0].text);
  } catch {
    console.error('Failed to parse alignment score response');
    return;
  }

  db.prepare(`
    UPDATE candidates SET alignment_score = ?, alignment_rationale = ?, updated_at = datetime('now') WHERE id = ?
  `).run(result.score, result.rationale, candidateId);

  logAudit(candidateId, 'alignment_score_computed', 'system', {
    score: result.score,
    discrepancies: result.discrepancies
  });

  return result;
}

module.exports = { computeAlignmentScore };
