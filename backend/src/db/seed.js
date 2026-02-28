const db = require('./schema');
const { randomUUID } = require('crypto');
const bcrypt = require('bcrypt');

async function seed() {
  console.log('Seeding database...');

  const candidates = [
    {
      id: randomUUID(),
      email: 'sarah.chen@example.com',
      password: 'password123',
      name: 'Sarah Chen',
      office: 'City Council Ward 3',
      election_level: 'local',
      district: 'Portland Ward 3',
      zip_codes: JSON.stringify(['97201', '97202', '97203']),
      party: 'Democratic',
      bio: 'Lifelong Portland resident and small business owner with 15 years of community advocacy experience.',
      persona_config: JSON.stringify({
        tone: 'warm and approachable',
        style_guidelines: 'Speak in plain language, avoid jargon. Use first-person voice.',
        key_phrases: ['community first', 'practical solutions', 'working together']
      }),
      donation_url: 'https://example.com/donate/sarah-chen',
      is_verified: 1,
      alignment_score: 92.5
    },
    {
      id: randomUUID(),
      email: 'james.rodriguez@example.com',
      password: 'password123',
      name: 'James Rodriguez',
      office: 'State House District 12',
      election_level: 'state',
      district: 'Oregon House District 12',
      zip_codes: JSON.stringify(['97204', '97205', '97206', '97207']),
      party: 'Republican',
      bio: 'Former small business owner and veteran committed to fiscal responsibility and economic growth.',
      persona_config: JSON.stringify({
        tone: 'direct and confident',
        style_guidelines: 'Lead with data and results. Be clear about priorities.',
        key_phrases: ['fiscal responsibility', 'economic freedom', 'limited government']
      }),
      donation_url: 'https://example.com/donate/james-rodriguez',
      is_verified: 1,
      alignment_score: 88.0
    },
    {
      id: randomUUID(),
      email: 'maria.johnson@example.com',
      password: 'password123',
      name: 'Maria Johnson',
      office: 'School Board District 5',
      election_level: 'local',
      district: 'Portland School District 5',
      zip_codes: JSON.stringify(['97201', '97202', '97208']),
      party: 'Independent',
      bio: 'Former teacher and education administrator with 20 years in Portland public schools.',
      persona_config: JSON.stringify({
        tone: 'thoughtful and evidence-based',
        style_guidelines: 'Reference research and data when available. Acknowledge complexity.',
        key_phrases: ['every student deserves', 'evidence-based policy', 'teacher support']
      }),
      donation_url: 'https://example.com/donate/maria-johnson',
      is_verified: 1,
      alignment_score: 95.0
    }
  ];

  const insertCandidate = db.prepare(`
    INSERT OR IGNORE INTO candidates
    (id, email, password_hash, name, office, election_level, district, zip_codes, party, bio, persona_config, donation_url, is_verified, alignment_score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const c of candidates) {
    const hash = await bcrypt.hash(c.password, 10);
    insertCandidate.run(c.id, c.email, hash, c.name, c.office, c.election_level, c.district, c.zip_codes, c.party, c.bio, c.persona_config, c.donation_url, c.is_verified, c.alignment_score);
  }

  // Sample context for Sarah Chen
  const sarahId = candidates[0].id;
  const insertContext = db.prepare(`
    INSERT OR IGNORE INTO candidate_contexts (id, candidate_id, content_type, content_text, topic_tags, content_hash)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const crypto = require('crypto');

  const housingText = `Housing Policy Platform — Sarah Chen\n\nAffordable housing is the defining issue of our time in Portland. My platform includes:\n1. Mandate 20% affordable units in all new developments over 10 units.\n2. Expand the city's rental assistance fund by $5M annually.\n3. Fast-track permitting for ADUs (accessory dwelling units) to increase housing supply.\n4. Partner with nonprofits to convert underutilized commercial properties to housing.\n5. Oppose luxury development that displaces existing residents without community benefit agreements.`;
  insertContext.run(randomUUID(), sarahId, 'manual', housingText, JSON.stringify(['housing']), crypto.createHash('sha256').update(housingText).digest('hex'));

  const economyText = `Economic Development Platform — Sarah Chen\n\nSupporting local businesses and workers:\n1. Create a small business micro-loan fund targeted at BIPOC and women-owned businesses.\n2. Establish a local hiring preference in city contracts.\n3. Expand the city's living wage ordinance to cover gig and contract workers.\n4. Partner with community colleges for workforce retraining programs.\n5. Streamline business licensing to reduce barriers for small entrepreneurs.`;
  insertContext.run(randomUUID(), sarahId, 'manual', economyText, JSON.stringify(['economy', 'local-business']), crypto.createHash('sha256').update(economyText).digest('hex'));

  // Sample blocked topic for James Rodriguez
  const jamesId = candidates[1].id;
  db.prepare(`INSERT OR IGNORE INTO blocked_topics (id, candidate_id, topic, redirect_message, redirect_url, is_active)
    VALUES (?, ?, ?, ?, ?, 1)`)
    .run(randomUUID(), jamesId, 'personal finances', 'I keep my personal finances separate from my campaign. For questions about campaign finance disclosure, please visit my official campaign filings.', 'https://example.com/filings/james-rodriguez');

  console.log('Seed data inserted successfully.');
  console.log(`\nSample login credentials:`);
  candidates.forEach(c => console.log(`  ${c.name}: ${c.email} / ${c.password}`));
}

module.exports = seed;

// Run directly if called via CLI
if (require.main === module) {
  seed().catch(console.error);
}
