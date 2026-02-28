/**
 * Seeds rich mock analytics data for Leslie Knope:
 * - 47 conversations over 30 days with real message exchanges
 * - Spread across topics: housing, parks, economy, education, environment, infrastructure
 * - Mix of anonymous and authenticated constituents
 */

require('dotenv').config();
const db = require('./schema');
const { randomUUID } = require('crypto');

const KNOPE_ID = 'fd0541a4-f077-4e3a-97e6-5a5b68f4340b';

// -- Insert mock constituent records so FK constraints pass --
const CONSTITUENTS = Array.from({ length: 18 }, () => randomUUID());
CONSTITUENTS.forEach((id, i) => {
  db.prepare(`INSERT OR IGNORE INTO constituents (id, email, zip_code, interest_tags) VALUES (?, ?, ?, ?)`)
    .run(id, `mock_voter_${i}@knope-analytics.test`, '97211', JSON.stringify(['housing','parks','economy']));
});

// -- Conversation templates by topic --
const CONV_TEMPLATES = [
  {
    topic_tags: ['housing', 'economy'],
    messages: [
      { role: 'user', content: 'What is your plan for affordable housing in Portland?' },
      { role: 'assistant', content: "Leslie believes affordable housing is the defining issue of our time. Her Knope Affordable Housing Initiative requires that 30% of all new developments with 10+ units be designated affordable. She also supports fast-tracking permits for ADUs and converting vacant commercial buildings into housing. Leslie often says: 'A city that doesn't house its people doesn't deserve the word city.'" },
      { role: 'user', content: 'How will you fund it without raising taxes?' },
      { role: 'assistant', content: "Great question! Leslie's plan uses a combination of developer impact fees, a dedicated affordable housing bond (approved by voters last cycle), and federal community development block grants. She's also proposed a 'Housing First' public-private partnership with three major employers to co-fund workforce housing near transit corridors — at zero cost to taxpayers." },
      { role: 'user', content: 'What about rent control?' },
      { role: 'assistant', content: "Leslie supports targeted rent stabilization — not blanket rent control. Her proposal would cap rent increases at 5% or CPI (whichever is lower) for existing tenants in buildings over 20 years old, while exempting new construction to preserve development incentives. She sees this as a balanced approach that protects long-term residents without killing new supply." },
    ],
    summary: 'Constituent asked about affordable housing policy, funding mechanisms, and rent stabilization. Strong engagement with 3 follow-ups.',
    message_count: 6,
  },
  {
    topic_tags: ['parks', 'environment'],
    messages: [
      { role: 'user', content: "I heard you want to expand Portland's parks. Can you tell me more?" },
      { role: 'assistant', content: "Parks are Leslie's passion — and that's putting it mildly! Her Green Portland Initiative would add 12 new neighborhood parks over 4 years, focusing on underserved districts east of 82nd Avenue where residents live more than half a mile from green space. She's also proposing a 'Parks for All' fund that makes all city rec center memberships income-scaled." },
      { role: 'user', content: 'What about the environmental cleanup at Oaks Bottom?' },
      { role: 'assistant', content: "Oaks Bottom is a priority. Leslie has committed to a full remediation plan funded through a combination of state environmental grants and holding the original polluters accountable via cost-recovery litigation. She's working with Portland Parks & Recreation and Oregon DEQ on a timeline to restore native wetland habitat within 3 years." },
      { role: 'user', content: "How are you different from the current council on parks?" },
      { role: 'assistant', content: "The current council has cut the parks maintenance budget three years running. Leslie would restore it to 2019 levels in year one and create an independent Parks Oversight Board with community members — not just political appointees — to ensure accountability. She's also the only candidate who has personally visited all 94 city-owned parks." },
    ],
    summary: 'Constituent asked about parks expansion, environmental cleanup, and compared Leslie to current council approach.',
    message_count: 6,
  },
  {
    topic_tags: ['economy', 'local-business'],
    messages: [
      { role: 'user', content: 'What will you do to support small businesses?' },
      { role: 'assistant', content: "Leslie's Small Business Recovery and Growth Fund would provide zero-interest microloans up to $25,000 for businesses with under 10 employees. She also wants to cut the city's small business license fees by 40% and create a single online portal — replacing the current seven-department bureaucracy — to get a business permit in under 5 business days." },
      { role: 'user', content: 'What about big corporations coming in and squeezing out local shops?' },
      { role: 'assistant', content: "Leslie supports a 'Local First' procurement policy requiring city agencies to buy from Portland-based businesses for contracts under $100K. She's also backing a Community Benefit Agreement framework that requires large retail developments over 10,000 sq ft to demonstrate they won't displace more than two existing local businesses within a half-mile radius." },
      { role: 'user', content: 'Are you against development altogether then?' },
      { role: 'assistant', content: "Not at all! Leslie strongly supports thoughtful development that creates jobs and brings in tax revenue. She wants more mixed-use development — retail on the ground floor, housing above — and she's actively recruiting three clean-tech companies to Portland's east side innovation corridor. Growth is good; unmanaged growth that displaces communities is the problem." },
      { role: 'user', content: 'Sounds reasonable. How do I learn more?' },
      { role: 'assistant', content: "You can read Leslie's full economic platform at her campaign site. She also holds monthly 'Office Hours' at rotating local coffee shops — no appointment needed. And of course, you can keep chatting with me! I'm always here to answer questions based on her verified platform." },
    ],
    summary: 'Constituent interested in small business support, local vs. corporate development balance. Very engaged — 4 follow-ups.',
    message_count: 8,
  },
  {
    topic_tags: ['education'],
    messages: [
      { role: 'user', content: 'What is Leslie Knope\'s position on school funding?' },
      { role: 'assistant', content: "Education is one of Leslie's core issues. She supports restoring full funding to Portland Public Schools, which have faced $28M in cuts over five years. Her Education First budget proposal would redirect 2% of the city's general fund — about $18M annually — to direct school support, covering counselors, arts programs, and after-school care." },
      { role: 'user', content: 'Is that the city council\'s job though? Isn\'t education a state issue?' },
      { role: 'assistant', content: "Great constitutional question! You're right that public school funding primarily flows through the state. But Portland City Council controls significant levers: city-owned properties for school use, infrastructure funding, after-school programming, housing stability for families (which directly affects school attendance), and the city's legislative agenda in Salem. Leslie would use all of these aggressively." },
      { role: 'user', content: 'What about school safety?' },
      { role: 'assistant', content: "Leslie supports a 'Safe Schools' initiative that funds mental health counselors in every Portland school — currently only 40% have a full-time counselor. She opposes putting more police in schools; instead, she backs restorative justice programs that have reduced suspensions by 60% in pilot schools. Her view: treat the root cause, don't just police the symptoms." },
    ],
    summary: 'Education funding questions including city vs. state roles and school safety approach.',
    message_count: 6,
  },
  {
    topic_tags: ['infrastructure', 'transportation'],
    messages: [
      { role: 'user', content: 'The roads in my neighborhood are terrible. What are you doing about it?' },
      { role: 'assistant', content: "Leslie hears this constantly, and she's frustrated too! Portland has a $4.6 billion maintenance backlog. Her Infrastructure Recovery Plan would dedicate an additional $50M annually to road and sidewalk repair — funded by a modest vehicle registration fee increase of $15/year for vehicles over 10 years old, which wealthier car owners would pay more of." },
      { role: 'user', content: 'What about biking and transit instead of just cars?' },
      { role: 'assistant', content: "Leslie is a strong advocate for multi-modal transportation. She wants to complete the missing links in the protected bike network east of 82nd, make all TriMet fares free for residents under 200% of poverty level, and restore the canceled 82nd Avenue MAX connection. She sees less car dependency as both a climate and equity issue." },
      { role: 'user', content: 'How realistic is free transit? Sounds expensive.' },
      { role: 'assistant', content: "The proposal is targeted, not city-wide free transit (that's a state/TriMet decision). Leslie's proposal covers low-income residents only — estimated cost is $12M annually, funded by parking revenue reform and a small commercial parking tax. Kansas City and many European cities have successfully implemented this model with measurable ridership increases among those who need it most." },
    ],
    summary: 'Infrastructure and transportation questions — roads, cycling, affordable transit.',
    message_count: 6,
  },
  {
    topic_tags: ['environment', 'taxes'],
    messages: [
      { role: 'user', content: 'What\'s your climate action plan?' },
      { role: 'assistant', content: "Leslie's Climate Portland 2035 plan commits the city to carbon neutrality by 2035 — 10 years ahead of the current target. Key elements: transition all city vehicles to electric by 2028, retrofit 500 city-owned buildings for energy efficiency, ban natural gas in new construction after 2026, and create a Green New Deal workforce program to train 2,000 Portlanders for clean energy jobs." },
      { role: 'user', content: "Won't the construction ban hurt builders?" },
      { role: 'assistant', content: "Leslie has worked directly with the Portland Home Builders Association on transition support. The ban includes a two-year implementation window and a $5M incentive program to help contractors retrain and re-equip for all-electric construction. She's also secured commitments from three major builders who say the electric mandate actually reduces long-term operating costs for homeowners." },
    ],
    summary: 'Climate action plan inquiry — 2035 carbon neutrality goals and construction standards.',
    message_count: 4,
  },
  {
    topic_tags: ['housing', 'civil-rights'],
    messages: [
      { role: 'user', content: 'How will you address homelessness?' },
      { role: 'assistant', content: "Leslie takes a housing-first approach. Her Pathways Home plan would add 300 permanent supportive housing units in year one, fund 15 new community navigation centers (not just shelters — places with case managers, health services, and job training), and expand the mental health street response team so people in crisis get care, not arrests." },
      { role: 'user', content: 'Aren\'t you just encouraging more homeless people to come to Portland?' },
      { role: 'assistant', content: "The data doesn't support the 'magnet' theory — most unhoused Portlanders lived here before losing their housing. The leading causes are rental cost increases, medical debt, domestic violence, and mental illness — not city policy generosity. Leslie believes addressing root causes is both the moral and fiscally responsible approach: emergency shelter costs $50K/person/year; permanent housing costs $18K." },
      { role: 'user', content: 'What about the encampments near schools?' },
      { role: 'assistant', content: "Leslie supports compassionate relocation — not sweeps that just move the problem. When an encampment is near a school or park, her protocol would be: 72-hour notice, offer of shelter placement with a real bed (not a mat on a floor), personal property storage, and follow-up case management. Sweeps without services cost $50K each and accomplish nothing lasting." },
      { role: 'user', content: 'I appreciate the thoughtful answer.' },
      { role: 'assistant', content: "Thank you for engaging on this — it's a complex issue that deserves more than bumper-sticker answers. Leslie genuinely believes Portland can do better, and that every person experiencing homelessness is a neighbor, not a problem to be managed. Feel free to ask more questions!" },
    ],
    summary: 'Homelessness policy — housing-first approach, encampments near schools, magnet theory.',
    message_count: 8,
  },
  {
    topic_tags: ['public-safety'],
    messages: [
      { role: 'user', content: 'Crime feels like it\'s getting worse. What will you do?' },
      { role: 'assistant', content: "Public safety is about more than policing — it's about addressing conditions that lead to crime. Leslie's Safe Portland plan has two tracks: (1) restore 50 sworn officer positions that were cut while redeploying police away from mental health calls, and (2) invest $8M in community-based violence intervention programs in the five highest-crime neighborhoods, modeled on Oakland's Ceasefire program (which reduced gun violence by 35%)." },
      { role: 'user', content: 'What about response times? Mine was 45 minutes for a car break-in.' },
      { role: 'assistant', content: "That's unacceptable, and Leslie agrees. She's proposing a tiered response system: a new civilian rapid-response unit for property crimes (reports, evidence collection, victim support) that frees sworn officers for violent crime response. This approach has cut property-crime response times in half in Denver and Nashville without adding sworn officers." },
    ],
    summary: 'Public safety questions — crime, police staffing, response times.',
    message_count: 4,
  },
  {
    topic_tags: ['economy', 'taxes'],
    messages: [
      { role: 'user', content: 'Will you raise my taxes if elected?' },
      { role: 'assistant', content: "Leslie believes in honest budgeting. She will not raise the general income tax rate. However, she does support two targeted measures: (1) a 1.5% surcharge on commercial properties over $5M in assessed value, and (2) closing the short-term rental loophole that allows AirBnb operators to avoid the city's lodging tax. Both measures together raise $22M annually — funding her parks and housing priorities." },
      { role: 'user', content: 'That sounds like a lot. Where does the city\'s current budget go?' },
      { role: 'assistant', content: "Portland's ~$835M general fund goes primarily to: public safety (41%), parks & recreation (8%), transportation (12%), housing and community services (10%), and central administration (29%). Leslie thinks the 29% admin figure is too high — her efficiency audit proposal would reduce it by 15% over 3 years, freeing $37M for direct services without new revenue." },
    ],
    summary: 'Tax and budget questions — what taxes will change and how current budget is allocated.',
    message_count: 4,
  },
  {
    topic_tags: ['parks', 'local-business'],
    messages: [
      { role: 'user', content: 'My kids\' soccer league was kicked out of the park for a paid event. Is that right?' },
      { role: 'assistant', content: "No, it's not right — and Leslie has made this a campaign issue. She's proposing a 'Community Hours First' policy that reserves 60% of park facility time for free community use, with paid permits only filling remaining slots. Youth sports leagues, community gardens, and neighborhood events would always have priority over commercial bookings." },
      { role: 'user', content: 'Can parks also generate revenue without hurting access?' },
      { role: 'assistant', content: "Absolutely. Leslie's Parks Revenue Innovation program would license small-footprint food and retail vendors in high-traffic parks — the kind you see in great cities like Copenhagen and Melbourne. Thoughtfully managed, these generate $3-4M annually for parks maintenance while actually improving the park experience. The key is scale and fit: no chains, local vendors only, nothing that dominates the green space." },
    ],
    summary: 'Parks access fairness and revenue generation without compromising community use.',
    message_count: 4,
  },
];

// Daily distribution over last 30 days
// Index 0 = 30 days ago, index 29 = today
const DAILY_COUNTS = [
  1, 1, 0, 1, 1, 0, 1, 1, 1, 0, // days 30-21
  1, 1, 1, 0, 1, 2,              // days 20-15
  1, 2, 1, 2, 2, 3, 2, 3, 3, 4, 3, 5, 4, 3, // days 14-1
];
// Today: 2 more (manually appended below)

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  // Vary the time within the day
  d.setHours(Math.floor(Math.random() * 14) + 7);
  d.setMinutes(Math.floor(Math.random() * 60));
  return d.toISOString().replace('T', ' ').slice(0, 19);
}

function endedAt(createdAt, messageDurationMinutes = 8) {
  const d = new Date(createdAt.replace(' ', 'T'));
  d.setMinutes(d.getMinutes() + messageDurationMinutes);
  return d.toISOString().replace('T', ' ').slice(0, 19);
}

// Build list of (dayIndex, templateIndex, isAnonymous) entries
const entries = [];
let templateIdx = 0;

// Clear existing conversations for Knope (from test chats)
db.prepare('DELETE FROM conversations WHERE candidate_id = ?').run(KNOPE_ID);
console.log('Cleared existing conversations for Leslie Knope');

const totalFromDaily = DAILY_COUNTS.reduce((a, b) => a + b, 0);
console.log(`Seeding ${totalFromDaily + 2} conversations over 30 days...`);

let convoCount = 0;

DAILY_COUNTS.forEach((count, dayIndex) => {
  const daysBack = 30 - dayIndex;
  for (let j = 0; j < count; j++) {
    const template = CONV_TEMPLATES[templateIdx % CONV_TEMPLATES.length];
    templateIdx++;
    const isAnon = convoCount % 3 === 0 ? 1 : 0; // ~33% anonymous
    const constituentId = isAnon ? null : CONSTITUENTS[convoCount % CONSTITUENTS.length];
    const createdAt = daysAgo(daysBack);
    const convId = randomUUID();

    db.prepare(`
      INSERT INTO conversations (id, candidate_id, constituent_id, is_anonymous, messages, summary, topic_tags, message_count, created_at, ended_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      convId, KNOPE_ID, constituentId, isAnon,
      JSON.stringify(template.messages),
      template.summary,
      JSON.stringify(template.topic_tags),
      template.message_count,
      createdAt,
      endedAt(createdAt, template.message_count * 1.5)
    );
    convoCount++;
  }
});

// Add 2 conversations from today
['housing', 'parks'].forEach((topic, i) => {
  const template = CONV_TEMPLATES[i];
  db.prepare(`
    INSERT INTO conversations (id, candidate_id, constituent_id, is_anonymous, messages, summary, topic_tags, message_count, created_at, ended_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    randomUUID(), KNOPE_ID, i === 0 ? CONSTITUENTS[0] : null, i === 0 ? 0 : 1,
    JSON.stringify(template.messages),
    template.summary,
    JSON.stringify([topic]),
    template.message_count,
    daysAgo(0),
    endedAt(daysAgo(0), template.message_count * 1.5)
  );
  convoCount++;
});

console.log(`\n✓ Seeded ${convoCount} conversations for Leslie Knope`);

// Verify
const check = db.prepare('SELECT COUNT(*) as count FROM conversations WHERE candidate_id = ?').get(KNOPE_ID);
console.log(`  DB count: ${check.count}`);

const topicCheck = db.prepare('SELECT topic_tags FROM conversations WHERE candidate_id = ?').all(KNOPE_ID);
const topicCounts = {};
topicCheck.forEach(c => {
  JSON.parse(c.topic_tags || '[]').forEach(t => {
    topicCounts[t] = (topicCounts[t] || 0) + 1;
  });
});
console.log('\nTopic distribution:');
Object.entries(topicCounts).sort(([,a],[,b]) => b-a).forEach(([t, c]) => console.log(`  ${t}: ${c}`));
