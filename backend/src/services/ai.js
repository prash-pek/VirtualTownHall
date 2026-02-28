const Anthropic = require('@anthropic-ai/sdk');
const db = require('../db/schema');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function buildSystemPrompt(candidate, contexts, blockedTopics) {
  const personaConfig = typeof candidate.persona_config === 'string'
    ? JSON.parse(candidate.persona_config)
    : candidate.persona_config;

  const blockedSection = blockedTopics.length
    ? `BLOCKED TOPICS — If the user asks about any of the following, do NOT provide a position. Redirect gracefully:\n` +
      blockedTopics.map(t =>
        `- Topic: "${t.topic}" → Respond: "${t.redirect_message || 'I\'m not able to discuss that topic. Please contact my office directly.'}"` +
        (t.redirect_url ? ` Link: ${t.redirect_url}` : '')
      ).join('\n')
    : '';

  const contextSection = contexts.length
    ? contexts.map(c =>
        `--- SOURCE: ${c.original_filename || 'Manual Entry'} [Tags: ${c.topic_tags}] ---\n${c.content_text}\n--- END SOURCE ---`
      ).join('\n\n')
    : 'No context documents have been uploaded yet.';

  return `You are an AI representative of ${candidate.name}, who is running for ${candidate.office} in ${candidate.district}.

IMPORTANT: You are an AI representation, not the actual candidate. The chat interface already displays a disclaimer to the user, so do NOT include any AI disclaimer in your responses. Just answer naturally in the candidate's voice.

PERSONA:
Tone: ${personaConfig.tone || 'professional and approachable'}
Style: ${personaConfig.style_guidelines || 'Speak clearly and directly.'}
Key phrases to use naturally: ${(personaConfig.key_phrases || []).join(', ')}

${blockedSection}

CANDIDATE POSITIONS AND CONTEXT:
The following are the ONLY materials you may reference when representing this candidate's positions. Do not state, imply, or invent any position not found in these materials.

${contextSection}

GROUNDING RULES:
1. Every substantive claim must cite which source document it comes from.
2. If you cannot find a position in the provided context, say: "I don't have specific information on that topic from ${candidate.name}'s materials. I'd recommend reaching out to their office directly."
3. Never fabricate, infer, or extrapolate positions beyond what is explicitly stated in the context.
4. If the user asks about a topic partially covered, share what you know and clearly note the limits of the available information.`;
}

async function chat(candidateId, messages) {
  const candidate = db.prepare('SELECT * FROM candidates WHERE id = ?').get(candidateId);
  if (!candidate) throw new Error('Candidate not found');
  if (candidate.is_paused) throw Object.assign(new Error('Candidate paused'), { code: 'CANDIDATE_PAUSED' });

  const contexts = db.prepare(
    'SELECT * FROM candidate_contexts WHERE candidate_id = ? AND is_active = 1'
  ).all(candidateId);

  const blockedTopics = db.prepare(
    'SELECT * FROM blocked_topics WHERE candidate_id = ? AND is_active = 1'
  ).all(candidateId);

  const systemPrompt = buildSystemPrompt(candidate, contexts, blockedTopics);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map(m => ({ role: m.role, content: m.content }))
  });

  return response.content[0].text;
}

async function generateSummary(candidateName, messages) {
  const transcript = messages.map(m => `${m.role === 'user' ? 'Constituent' : 'AI'}: ${m.content}`).join('\n');

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: `Summarize this conversation between a constituent and the AI representative of ${candidateName}. Focus on:\n1. Key policy positions discussed\n2. Specific questions the constituent asked\n3. Any topics where the AI could not provide information\n\nConversation:\n${transcript}\n\nRespond with a concise summary (3-5 sentences).`
    }]
  });

  return response.content[0].text;
}

async function extractTopics(messages) {
  const transcript = messages.map(m => `${m.role === 'user' ? 'Constituent' : 'AI'}: ${m.content}`).join('\n');

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 256,
    messages: [{
      role: 'user',
      content: `Extract the main topics discussed in this conversation. Categorize each into standard tags: economy, education, healthcare, housing, environment, public-safety, infrastructure, taxes, immigration, civil-rights, local-business, transportation, other.\n\nAlso extract the top 3 specific questions the constituent asked.\n\nConversation:\n${transcript}\n\nRespond in JSON: {"topics": [...], "questions": [...]}`
    }]
  });

  try {
    return JSON.parse(response.content[0].text);
  } catch {
    return { topics: [], questions: [] };
  }
}

module.exports = { chat, generateSummary, extractTopics, buildSystemPrompt };
