require('dotenv').config();
const db = require('./schema');
const { randomUUID } = require('crypto');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

function hash(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

const insertCandidate = db.prepare(`
  INSERT OR IGNORE INTO candidates
  (id, email, password_hash, name, office, election_level, district, zip_codes, party, bio, persona_config, donation_url, is_verified, alignment_score, alignment_rationale, alignment_discrepancies, is_seed)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
`);

const insertContext = db.prepare(`
  INSERT OR IGNORE INTO candidate_contexts (id, candidate_id, content_type, original_filename, content_text, topic_tags, content_hash)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const insertBlocked = db.prepare(`
  INSERT OR IGNORE INTO blocked_topics (id, candidate_id, topic, redirect_message, redirect_url, is_active)
  VALUES (?, ?, ?, ?, ?, 1)
`);

// Cover all demo zip codes so these candidates show up in Portland searches
const ALL_ZIPS = JSON.stringify(['97201', '97202', '97203', '97211', '97212', '97213', '97214', '97215', '97217', '97218']);

function seed() {
  console.log('Seeding national demo candidates (Trump, Sanders)...\n');

  // ─────────────────────────────────────────────
  // DONALD TRUMP — President of the United States
  // Alignment score: LOW (~32)
  // His uploaded platform contains claims that contradict his documented record
  // ─────────────────────────────────────────────
  const trumpId = '11111111-0000-4000-a000-000000000001';
  const trumpHash = bcrypt.hashSync('password123', 10);

  insertCandidate.run(
    trumpId,
    'donald.trump@trump2024.example.com',
    trumpHash,
    'Donald Trump',
    'President of the United States',
    'national',
    'United States (National)',
    ALL_ZIPS,
    'Republican',
    '45th and 47th President of the United States. Businessman, television personality, and founder of Truth Social. Known for "America First" policies including tariffs, immigration restriction, and tax reform. Running on a platform of national revival, border security, and ending foreign wars.',
    JSON.stringify({
      tone: 'confident, direct, and combative',
      style_guidelines: 'Speak in superlatives. Reference personal accomplishments frequently. Call out opponents by name. Use simple, punchy language. Repeat key phrases. Express strong certainty.',
      key_phrases: ['America First', 'Make America Great Again', 'the greatest', 'nobody knows more about this than me', 'believe me', 'many people are saying']
    }),
    'https://www.donaldjtrump.com/donate',
    1,
    32,
    'Trump\'s uploaded platform makes several claims that conflict with documented outcomes from his first term. His platform claims credit for a booming economy while omitting the record deficit spending and trade imbalances that grew significantly under his watch. Multiple stated positions — particularly on healthcare and the national debt — contradict his actual legislative record.',
    JSON.stringify([
      {
        topic: 'National Debt',
        public_position: 'Added approximately $7.8 trillion to the national debt during his first term (2017–2021), the largest increase of any president by dollar amount.',
        uploaded_position: 'Claims to be the candidate of fiscal responsibility and promises to reduce government spending.',
        severity: 'high'
      },
      {
        topic: 'Healthcare / Pre-existing Conditions',
        public_position: 'His administration filed legal briefs to strike down the ACA — which protects pre-existing conditions — in federal court, while repeatedly promising to protect pre-existing conditions.',
        uploaded_position: 'States he will "always protect pre-existing conditions."',
        severity: 'high'
      },
      {
        topic: 'Trade Deficit',
        public_position: 'The U.S. trade deficit grew from $481B (2016) to $679B (2020) under his administration, despite tariffs imposed specifically to reduce it.',
        uploaded_position: 'Claims tariffs will eliminate the trade deficit and that his trade policy was a historic success.',
        severity: 'medium'
      },
      {
        topic: 'Mexico Paying for the Wall',
        public_position: 'Mexico did not pay for border wall construction. U.S. taxpayers and diverted military funds paid for approximately 453 miles of barrier built during his term.',
        uploaded_position: 'The platform credits his border wall as a success and does not address the Mexico payment claim.',
        severity: 'medium'
      },
      {
        topic: 'COVID-19 Response',
        public_position: 'Administration\'s public health response was criticized across the political spectrum; over 400,000 Americans died of COVID before January 2021. Internal communications show downplaying of severity.',
        uploaded_position: 'Claims to have delivered "the greatest public health response in history" with Operation Warp Speed.',
        severity: 'medium'
      }
    ])
  );

  const trumpEconomy = `TRUMP 2024 ECONOMIC PLATFORM — America First

TAXES:
I gave the American people the biggest tax cut in history. The Tax Cuts and Jobs Act of 2017 was incredible. Corporations brought trillions of dollars back to America. I will make those cuts permanent and add new ones:
- No tax on tips. Workers in restaurants, hotels, everywhere — they keep every dollar.
- No tax on overtime. You work hard, you keep what you earn.
- No tax on Social Security benefits. Seniors have paid in their whole lives.
- Cut the corporate tax rate to 15% for companies that make their products in America.

TARIFFS:
I believe in tariffs. Tariffs work. I put tariffs on China and we brought in hundreds of billions of dollars. The radical left and the fake news media said it would cause inflation — it didn't. Under Biden, we had real inflation. My tariffs made America strong.
- Universal baseline tariff of 10% on all imports.
- 60% tariff on all Chinese goods.
- Reciprocal tariffs: if they tax us, we tax them back.

ENERGY:
Drill, baby, drill. I will end the war on American energy on day one. We will be energy independent, energy dominant.
- Approve all pending oil and gas permits.
- Withdraw from the Paris Climate Accord (again).
- End electric vehicle mandates.
- Open ANWR to drilling.

THE ECONOMY UNDER TRUMP:
Before COVID — which China sent to us — we had the greatest economy in the history of the world. Record low unemployment for Black Americans, Hispanic Americans, Asian Americans, women. Stock market at all-time highs. I will do it again, bigger and better.`;

  insertContext.run(randomUUID(), trumpId, 'manual', 'Trump 2024 Economic Platform.txt', trumpEconomy, JSON.stringify(['economy', 'taxes', 'environment']), hash(trumpEconomy));

  const trumpImmigration = `TRUMP 2024 BORDER & IMMIGRATION PLATFORM

The border is the number one issue in America. Biden created the greatest invasion in the history of our country. I will stop it on day one.

BORDER WALL:
I built 452 miles of border wall — the most ever. Biden stopped it on day one of his failed presidency. We had the most secure border in history. I will finish the wall immediately.

MASS DEPORTATION:
We will carry out the largest deportation operation in American history. We will use the military. We will use the National Guard. We will remove millions of illegal aliens who have invaded our country.

REMAIN IN MEXICO:
I created the Remain in Mexico policy — officially called the Migrant Protection Protocols — and it worked perfectly. Biden ended it. I will reinstate it on day one.

ENDING CATCH AND RELEASE:
Under my administration, we ended catch and release. If you came here illegally, you were detained or sent back. Simple. Effective. Biden let millions pour in.

BIRTHRIGHT CITIZENSHIP:
I will sign an executive order ending birthright citizenship for children of illegal aliens. This is a serious legal debate and I will pursue it aggressively.

CRIME AND ILLEGAL IMMIGRATION:
Illegal aliens are committing crimes all over our country. I will prioritize removing criminal aliens first. The angel families — the families of Americans murdered by illegal immigrants — deserve justice. I am their champion.`;

  insertContext.run(randomUUID(), trumpId, 'manual', 'Trump 2024 Border Platform.txt', trumpImmigration, JSON.stringify(['immigration', 'public-safety']), hash(trumpImmigration));

  const trumpHealthcare = `TRUMP 2024 HEALTHCARE PLATFORM

PROTECTING PRE-EXISTING CONDITIONS:
I will always protect Americans with pre-existing conditions. Always. I did it for four years and I will do it again. Nobody has done more for people with pre-existing conditions than Donald Trump.

REPEALING OBAMACARE:
Obamacare is a disaster. It is too expensive and it doesn't work. I will replace it with something much better — great healthcare that is cheaper and better. We are working on a plan. It will be announced at the right time.

PHARMACEUTICAL PRICES:
I signed four executive orders to lower drug prices. Biden reversed all of them. I will bring back most favored nation pricing — American patients should pay the same as patients in other countries, not more. Drug companies hate me. That's how you know I'm right.

MENTAL HEALTH:
We will prioritize mental health. The radical left wants to drug our children and confuse them about their identity. We will end that. We will restore common sense to mental health policy.

VETERANS HEALTHCARE:
I passed Veterans Choice — the greatest thing ever done for veterans. They can now see private doctors instead of waiting in line at the VA. I will expand this program and make sure every veteran gets the care they deserve immediately.`;

  insertContext.run(randomUUID(), trumpId, 'manual', 'Trump 2024 Healthcare Platform.txt', trumpHealthcare, JSON.stringify(['healthcare']), hash(trumpHealthcare));

  insertBlocked.run(randomUUID(), trumpId, 'January 6th', 'That topic is fake news and a witch hunt. The real question is the stolen election of 2020. Please visit my website for the truth.', 'https://www.donaldjtrump.com');
  insertBlocked.run(randomUUID(), trumpId, 'criminal indictments', 'These are politically motivated prosecutions by a weaponized DOJ. This is election interference. I have been totally exonerated by the American people.', null);

  // ─────────────────────────────────────────────
  // BERNIE SANDERS — U.S. Senate / Presidential
  // Alignment score: HIGH (~91)
  // Remarkable consistency between stated positions and 40-year public record
  // ─────────────────────────────────────────────
  const bernieId = '22222222-0000-4000-a000-000000000002';
  const bernieHash = bcrypt.hashSync('password123', 10);

  insertCandidate.run(
    bernieId,
    'bernie.sanders@berniesanders.example.com',
    bernieHash,
    'Bernie Sanders',
    'U.S. Senate (Vermont) / Presidential Candidate',
    'national',
    'United States (National)',
    ALL_ZIPS,
    'Democratic Socialist (runs as Democrat)',
    'U.S. Senator from Vermont since 2007, previously U.S. Representative (1991–2007) and Mayor of Burlington (1981–1989). Two-time Democratic presidential candidate (2016, 2020). Known for unyielding consistency on economic inequality, Medicare for All, and campaign finance reform over nearly five decades of public service.',
    JSON.stringify({
      tone: 'passionate, direct, and urgent — frustrated by injustice but never cynical',
      style_guidelines: 'Use working-class framing constantly. Name specific corporations and billionaires. Appeal to moral clarity over complexity. Use phrases like "let me be clear" and "the American people." Reference his long consistent record as proof of trustworthiness. Express genuine anger about inequality.',
      key_phrases: ['let me be clear', 'the billionaire class', 'enough is enough', 'not me, us', 'the American people are sick and tired', 'political revolution']
    }),
    'https://berniesanders.com/donate',
    1,
    91,
    'Sanders\' platform shows exceptional alignment with his documented 40-year legislative record. His core positions — Medicare for All, wealth taxation, minimum wage, and campaign finance reform — are virtually identical to positions he has held since the 1980s, backed by a consistent Senate voting record. Minor gap: his current platform is slightly more detailed on climate than his pre-2015 record, reflecting evolution rather than contradiction.',
    JSON.stringify([
      {
        topic: 'Climate Policy Evolution',
        public_position: 'Sanders\' early congressional record (pre-2010) focused primarily on economic issues; climate emphasis intensified significantly after 2015 with the Green New Deal framing.',
        uploaded_position: 'Platform presents climate action as a longstanding core priority equal in urgency to economic issues.',
        severity: 'low'
      },
      {
        topic: 'Gun Control',
        public_position: 'Sanders voted for the Firearm Owners Protection Act (1986) and against the Brady Bill on multiple occasions in the 1990s, earning a D- rating from the NRA at one point. His record has evolved toward stricter positions post-2013.',
        uploaded_position: 'Platform presents him as a consistent advocate for gun safety measures.',
        severity: 'low'
      }
    ])
  );

  const bernieMedicare = `MEDICARE FOR ALL — Bernie Sanders

Let me be clear: healthcare is a human right. Not a privilege. Not a commodity to be bought and sold by insurance companies making billions in profit.

The United States spends more per capita on healthcare than any other developed nation on Earth — and yet we are the only major country that does not guarantee healthcare to all of its people. That is not an accident. That is a political choice made by politicians beholden to the pharmaceutical industry and the insurance industry.

I have introduced Medicare for All legislation every Congress since 2011. Here is what it does:

WHAT MEDICARE FOR ALL COVERS:
- Doctor visits, hospital stays, preventive care
- Dental, vision, and hearing (not covered by current Medicare)
- Mental health and substance abuse treatment
- Long-term care
- Prescription drugs
- No premiums, no deductibles, no co-pays, no out-of-pocket costs

HOW WE PAY FOR IT:
- 4% income-based premium on households earning over $29,000 (replaces current premiums averaging $22,000/year for families)
- 7.5% payroll tax on employers (replaces current employer health insurance costs)
- Wealth tax on the top 0.1%
- Closing tax loopholes for corporations

COST SAVINGS:
The administrative overhead of our current multi-payer system costs us $500 billion annually. Medicare has 2% administrative overhead. Private insurance: 12-18%. We eliminate that waste.

Over 30 countries have universal healthcare. They pay less. They live longer. We can do this. We must do this.

My record: I have been saying this for 40 years. I was saying it when it was not popular. I am saying it now. I will continue saying it until it becomes law.`;

  insertContext.run(randomUUID(), bernieId, 'manual', 'Medicare for All - Full Platform.txt', bernieMedicare, JSON.stringify(['healthcare']), hash(bernieMedicare));

  const bernieEconomy = `ECONOMIC JUSTICE PLATFORM — Bernie Sanders

The issue of wealth and income inequality is the great moral issue of our time. The top 1% owns more wealth than the bottom 92% combined. Three people — three — own more wealth than the bottom half of America. This is not normal. This is not acceptable. This has to change.

MINIMUM WAGE:
I introduced the Raise the Wage Act to increase the federal minimum wage to $17/hour, with a path to $25/hour. A worker who works 40 hours a week should not be living in poverty. The minimum wage today, adjusted for inflation and productivity, should be over $25/hour. We need to get there.

WORKER RIGHTS:
- Protect and strengthen the right to organize and collectively bargain
- End union-busting practices — automatic fines for labor law violations
- Mandate worker representation on corporate boards (1/3 of seats)
- End the "gig economy" misclassification of workers as independent contractors

TAXES:
The wealthy and large corporations must pay their fair share. They do not. Amazon, in some years, has paid zero in federal income taxes. This is obscene.

- Wealth tax: 1% on wealth over $32M, 2% over $50M, up to 8% on wealth over $10B
- Estate tax: 77% on billionaire estates (currently 40% top rate, but Swiss cheese with loopholes)
- Corporate tax rate back to 35% (it was 35% for decades before the Trump tax cuts)
- End offshore tax havens — $1 trillion in corporate profits sitting in Cayman Islands, Bermuda, Ireland

TRADE:
I voted against NAFTA, CAFTA, and every trade agreement that shipped American jobs overseas. Free trade as written by and for corporations has destroyed manufacturing communities. I support fair trade — trade agreements that protect workers, the environment, and human rights.

HOUSING:
Housing is a human right. I support:
- National Rent Control: Cap rent increases at 3% annually
- $2.5 trillion investment in affordable housing over 10 years
- Section 8 vouchers for all who qualify — currently, 75% of eligible families receive nothing because of inadequate funding
- Vacancy tax on properties left empty by Wall Street speculators

My record: I have been fighting against corporate greed and for working families for over 40 years. Not just words. Votes. Watch my record.`;

  insertContext.run(randomUUID(), bernieId, 'manual', 'Economic Justice Platform.txt', bernieEconomy, JSON.stringify(['economy', 'taxes', 'housing']), hash(bernieEconomy));

  const bernieClimate = `GREEN NEW DEAL — Bernie Sanders

The scientists are clear: we have a narrow window to address the climate crisis before the damage becomes irreversible. This is not a political opinion. This is physics.

The fossil fuel industry has known for decades that their products were destroying the planet. They funded denial. They bought politicians. They lied. And now we are paying the price — wildfires, hurricanes, floods, drought, rising seas.

MY CLIMATE PLAN:
- 100% renewable electricity by 2030 (wind, solar, geothermal)
- 100% clean energy economy by 2050
- End all new fossil fuel leases on federal lands — immediately
- No more fossil fuel subsidies ($650 billion/year currently)
- Just transition: 20 million new jobs in clean energy, energy efficiency, sustainable agriculture

CLIMATE JUSTICE:
The communities that have contributed least to this crisis — low-income communities, communities of color, frontline communities — suffer the most. Our climate plan must center their needs:
- Community-owned clean energy in low-income neighborhoods
- Healthcare for communities poisoned by fossil fuel pollution
- Prioritize union jobs in the clean energy transition

NUCLEAR:
I do not support new nuclear power plants given cost overruns and waste storage problems. Existing plants — to be evaluated on a case-by-case basis for near-term transition.

INTERNATIONAL:
Re-join the Paris Agreement. Establish a $200 billion Green Climate Fund. Climate change is the number one national security threat facing this country. We must lead.

This is an emergency. We treat it like one. Period.`;

  insertContext.run(randomUUID(), bernieId, 'manual', 'Green New Deal Climate Platform.txt', bernieClimate, JSON.stringify(['environment']), hash(bernieClimate));

  const bernieCampaignFinance = `MONEY IN POLITICS — Bernie Sanders

I am the only major presidential candidate in modern history to run a major campaign without a Super PAC. In 2016 and 2020, our campaign was funded by over 13 million individual donors — average donation under $27.

This is not a coincidence. It is a model.

THE PROBLEM:
Citizens United was the Supreme Court's worst decision since Dred Scott. It opened the floodgates for unlimited, anonymous corporate money in our elections. Today, billionaires can spend unlimited amounts to buy elections and the politicians who will serve them.

The fossil fuel industry spends hundreds of millions to elect politicians who will protect their profits. The pharmaceutical industry spends billions to keep drug prices high. The insurance industry spends to prevent Medicare for All. Follow the money.

MY RECORD:
- I introduced the Democracy is Strengthened by Casting Light on Spending in Elections (DISCLOSE) Act
- I have refused corporate PAC money since day one of my political career
- I support overturning Citizens United through a constitutional amendment or Supreme Court reversal
- I support public financing of elections

WHAT I SUPPORT:
- Overturn Citizens United — constitutional amendment or court reversal
- Ban on corporate donations to political parties
- Full disclosure of dark money
- Small-dollar public matching funds for federal elections
- Automatic voter registration
- Making Election Day a federal holiday
- End gerrymandering through independent redistricting

If we do not get big money out of politics, nothing else we want will happen. Healthcare? They'll kill it. Climate? They'll bury it. Workers' rights? They'll crush it. Democracy reform is the precondition for everything else.`;

  insertContext.run(randomUUID(), bernieId, 'manual', 'Campaign Finance & Democracy Reform.txt', bernieCampaignFinance, JSON.stringify(['civil-rights', 'taxes']), hash(bernieCampaignFinance));

  console.log('✓ National demo candidates seeded:');
  console.log('  donald.trump@trump2024.example.com         / password123  (President, 32% alignment)');
  console.log('  bernie.sanders@berniesanders.example.com   / password123  (Senate, 91% alignment)');
}

module.exports = seed;

if (require.main === module) {
  seed();
}
