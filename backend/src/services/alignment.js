const Anthropic = require('@anthropic-ai/sdk');
const db = require('../db/schema');
const { logAudit } = require('../utils/audit');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Strip markdown code fences Claude sometimes wraps JSON in
function extractJSON(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  return text.trim();
}

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
        content: `Search for recent public statements, voting records, interviews, and documented policy positions by ${candidate.name} who is running for ${candidate.office} in ${candidate.district}. Collect specific factual policy positions from at least 3 different sources. Focus on verifiable claims and voting records, not campaign rhetoric.`
      }]
    });

    const textBlocks = searchResponse.content.filter(b => b.type === 'text');
    publicRecord = textBlocks.map(b => b.text).join('\n');
  } catch (err) {
    console.error('Web search for alignment score failed:', err.message);
    publicRecord = 'Web search unavailable. Evaluate based on general knowledge of this candidate\'s public record.';
  }

  const comparisonResponse = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `You are a nonpartisan political fact-checker. Analyze the alignment between a political candidate's publicly documented record and their uploaded platform context.

PUBLIC RECORD AND STATEMENTS:
${publicRecord}

CANDIDATE'S UPLOADED PLATFORM CONTEXT:
${contextText}

Evaluate alignment across these dimensions:
1. Policy positions: Do uploaded positions match documented public statements and voting record?
2. Consistency: Are there flip-flops or contradictions between their public record and uploaded platform?
3. Omissions: Are significant public positions or voting record items missing from the uploaded context?
4. Accuracy: Are claims in the uploaded context factually accurate relative to their public record?

Scoring guide:
- 85-100: Highly consistent — platform closely matches public record with minor gaps
- 65-84: Moderate alignment — mostly consistent with some notable omissions or soft contradictions
- 40-64: Significant discrepancies — multiple contradictions or misleading framing of record
- 0-39: Low alignment — platform substantially misrepresents or contradicts documented record

Respond in JSON only (no markdown fences):
{
  "score": <0-100 integer>,
  "rationale": "<2-3 sentence nonpartisan explanation of the score>",
  "discrepancies": [
    {"topic": "...", "public_position": "...", "uploaded_position": "...", "severity": "low|medium|high"}
  ]
}`
    }]
  });

  let result;
  try {
    result = JSON.parse(extractJSON(comparisonResponse.content[0].text));
  } catch {
    console.error('Failed to parse alignment score response:', comparisonResponse.content[0].text.slice(0, 200));
    return;
  }

  db.prepare(`
    UPDATE candidates
    SET alignment_score = ?, alignment_rationale = ?, alignment_discrepancies = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(result.score, result.rationale, JSON.stringify(result.discrepancies || []), candidateId);

  logAudit(candidateId, 'alignment_score_computed', 'system', {
    score: result.score,
    discrepancy_count: (result.discrepancies || []).length,
  });

  return result;
}

module.exports = { computeAlignmentScore };
