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
  (id, email, password_hash, name, office, election_level, district, zip_codes, party, bio, persona_config, donation_url, is_verified, alignment_score, alignment_rationale)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertContext = db.prepare(`
  INSERT OR IGNORE INTO candidate_contexts (id, candidate_id, content_type, original_filename, content_text, topic_tags, content_hash)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const insertBlocked = db.prepare(`
  INSERT OR IGNORE INTO blocked_topics (id, candidate_id, topic, redirect_message, redirect_url, is_active)
  VALUES (?, ?, ?, ?, ?, 1)
`);

function seed() {
  console.log('Seeding demo candidates for ZIP 97211...\n');

  // ─────────────────────────────────────────────
  // 1. LESLIE KNOPE — City Council
  // ─────────────────────────────────────────────
  const leslieId = randomUUID();
  const leslieHash = bcrypt.hashSync('password123', 10);
  insertCandidate.run(
    leslieId,
    'leslie.knope@pawneegov.com',
    leslieHash,
    'Leslie Knope',
    'City Council District 4',
    'local',
    'Portland Northeast District 4 (ZIP 97211)',
    JSON.stringify(['97211', '97212', '97213']),
    'Knope 2026 Party (formerly Democratic)',
    'Former Deputy Director of the Pawnee Parks & Recreation Department, now bringing that same unstoppable civic energy to Portland. Author of 47 binders on local policy. Recipient of the Muriel Award for Exceptional Government Service (self-nominated). Best friend: Ann Perkins.',
    JSON.stringify({
      tone: 'extremely enthusiastic and deeply knowledgeable',
      style_guidelines: 'Use exclamation points liberally. Reference the community constantly. Mention waffles when appropriate. Cite specific binder page numbers. Express genuine love for government and public service.',
      key_phrases: ['government is great', 'for the people', 'Ann, you beautiful tropical fish', 'this is happening', 'I am big enough to admit']
    }),
    'https://leslieknope2026.example.com/donate',
    1,
    97.5,
    'Leslie Knope\'s uploaded platform is exceptionally detailed and aligns almost perfectly with her extensive public record of civic advocacy. Minor discrepancy: her platform understates her passion for waffles as a policy metaphor.'
  );

  const leslieParks = `PARKS & PUBLIC SPACES PLATFORM — Leslie Knope for City Council

Parks are not a luxury. Parks are democracy made physical. Every blade of grass in a public park is a vote for the kind of society we want to live in.

My comprehensive 14-point parks platform (excerpted from Binder Vol. 3, Tabs A through K):

1. EXPAND RIVERSIDE PARK: Double the acreage by acquiring the adjacent industrial lot. I have been negotiating this for 4 years and I am THIS close.

2. NEW COMMUNITY CENTER: Build a state-of-the-art community center in the Irvington neighborhood with a pool, a gymnasium, a ceramics studio, and a waffle bar (non-negotiable).

3. PLAYGROUND EQUITY: Every child in ZIP 97211 should be within a 10-minute walk of a quality playground. Current gap: 3 neighborhoods. Timeline to close gap: 18 months.

4. COMMUNITY GARDENS: Expand the urban garden program from 8 plots to 80 plots. Local food is community food.

5. MURALS AND PUBLIC ART: Allocate $200K annually for public art installations selected by community vote.

6. DOG PARKS: Three new off-leash areas. Dogs are constituents too. (They cannot vote, but their owners can and do.)

Leslie Knope's position: I believe in parks the way some people believe in a higher power. They are sacred. I will protect them with every ounce of my being and also several well-organized binders.`;

  insertContext.run(randomUUID(), leslieId, 'manual', 'Parks Platform (Binder Vol 3).txt', leslieParks, JSON.stringify(['parks', 'infrastructure', 'housing']), hash(leslieParks));

  const leslieGov = `GOVERNMENT TRANSPARENCY & CIVIC ENGAGEMENT — Leslie Knope for City Council

I love government. I know that sounds weird. But government — good government — is just neighbors helping neighbors at scale.

TRANSPARENCY INITIATIVES:
- Monthly town halls in every neighborhood (with light refreshments — I will bring the waffles)
- Live-streamed city council meetings with real-time Q&A
- "Open Binder" portal: every policy document I produce will be publicly available online
- Constituent office hours: 3 hours every Tuesday, Thursday, and Saturday morning
- Youth Council: a 12-member advisory board of residents ages 14-18

CIVIC PARTICIPATION:
- Automatic voter registration for all residents turning 18
- Multilingual ballots and city communications (Spanish, Vietnamese, Somali)
- Community input required before any vote on zoning, parks, or infrastructure
- Annual "Leslie Knope Is Listening" festival (free admission, free waffles)

ENDORSEMENTS: Ann Perkins (my best friend and an actual genius), Ben Wyatt (my husband and former Ice Town mayor — long story), Tom Haverford (entrepreneur), April Ludgate (reluctant supporter, confirmed via grunt).

I have a 94-page plan for my first 100 days. Available upon request. Actually, I'll just give it to you. Here it is. All 94 pages.`;

  insertContext.run(randomUUID(), leslieId, 'manual', 'Civic Engagement Platform.txt', leslieGov, JSON.stringify(['civil-rights', 'local-business', 'education']), hash(leslieGov));

  // ─────────────────────────────────────────────
  // 2. RON SWANSON — Mayor
  // ─────────────────────────────────────────────
  const ronId = randomUUID();
  const ronHash = bcrypt.hashSync('password123', 10);
  insertCandidate.run(
    ronId,
    'ron.swanson@notthegovernment.com',
    ronHash,
    'Ron Swanson',
    'Mayor',
    'local',
    'Portland (All Districts)',
    JSON.stringify(['97211', '97212', '97201', '97202', '97203']),
    'Libertarian',
    'Retired government bureaucrat who spent 20 years as Director of the Pawnee Parks & Recreation Department working as hard as possible to make sure the government did as little as possible. Master woodworker. Meat enthusiast. Hates government. Running for Mayor to shrink city hall to a building approximately the size of a shed.',
    JSON.stringify({
      tone: 'extremely terse, confident, and mildly irritated',
      style_guidelines: 'Use as few words as possible. Never express enthusiasm about government programs. Express enthusiasm only about meat, woodworking, fishing, and individual liberty. Distrust all questions. End responses abruptly.',
      key_phrases: ['government is bad', 'do it yourself', 'stay out of my life', 'I am a simple man', 'permit? I don\'t need a permit']
    }),
    'https://swanson2026.example.com',
    1,
    71.0,
    'Ron Swanson\'s public record is difficult to verify because he has deliberately avoided creating a paper trail for most of his career. His uploaded platform is characteristically sparse. Alignment score reflects the limited overlap between his stated positions and available public information.'
  );

  const ronPlatform = `RON SWANSON FOR MAYOR — OFFICIAL PLATFORM

I was asked to write a platform. Here it is.

1. TAXES: Lower them. Much lower. Ideally: none.

2. REGULATIONS: Remove them. All of them. If a man wants to build a deck without a permit, that is between him and God and his lumber.

3. CITY STAFF: The City of Portland currently employs 7,400 people. My target: 40. Maybe 35. I have a list.

4. PARKS: I believe in parks, reluctantly, because children need somewhere to be. I do not believe parks need "programming" or "events" or "a dedicated social media coordinator." A park is grass. Possibly a tree. That is all.

5. BUSINESS REGULATION: Eliminated. If a man wants to open a restaurant, he opens a restaurant. The market will decide if it is good. The market is smarter than any zoning board.

6. PUBLIC TRANSIT: I drive myself. This is an option available to all citizens.

7. EDUCATION: Schools should teach reading, mathematics, and how to change a tire. Everything else is gravy. Gravy is good. More gravy.

8. MEAT: Strongly pro-meat. This is not a policy position. It is a way of life. But if elected, I will ensure that Portland does not pass any ordinances restricting the consumption of bacon, red meat, or anything cooked over an open flame on private property.

RON SWANSON'S COMMITMENT TO YOU: I will do as little as possible. That is my promise. That is the highest promise any politician can make.`;

  insertContext.run(randomUUID(), ronId, 'manual', 'Swanson Platform (One Page, As God Intended).txt', ronPlatform, JSON.stringify(['taxes', 'economy', 'local-business', 'infrastructure']), hash(ronPlatform));

  insertBlocked.run(randomUUID(), ronId, 'government programs', 'I don\'t discuss government programs because I don\'t believe in them. If you need something done, do it yourself. That is the end of this conversation.', null);
  insertBlocked.run(randomUUID(), ronId, 'social services', 'Neighbors help neighbors. That\'s it. Next question.', null);

  // ─────────────────────────────────────────────
  // 3. MICHAEL SCOTT — City Council
  // ─────────────────────────────────────────────
  const michaelId = randomUUID();
  const michaelHash = bcrypt.hashSync('password123', 10);
  insertCandidate.run(
    michaelId,
    'michael.scott@worldsbestcandidate.com',
    michaelHash,
    'Michael Scott',
    'City Council At-Large',
    'local',
    'Portland At-Large',
    JSON.stringify(['97211', '97210', '97214', '97215']),
    'Independent (The Michael Scott Party)',
    'Former Regional Manager of Dunder Mifflin Scranton branch — the best branch, by the way, number one in sales three years running, mostly because of me. Now bringing that same leadership energy to Portland city government. I am not superstitious, but I am a little stitious about winning this election.',
    JSON.stringify({
      tone: 'enthusiastic, self-aggrandizing, frequently off-topic but means well',
      style_guidelines: 'Start answers with a pop culture reference or personal anecdote. Circle back to the actual policy eventually. Use phrases like "that\'s what she said" sparingly but inevitably. Express deep love for constituents. Get slightly distracted. Land on something genuine at the end.',
      key_phrases: ['I\'m not a regular politician, I\'m a cool politician', 'would I rather be feared or loved?', 'that\'s what she said', 'this is the story of a man who could have done nothing', 'I am Beyoncé, always']
    }),
    'https://worldsbestcandidate.example.com',
    1,
    58.0,
    'Michael Scott\'s alignment score is complicated by the fact that many of his public statements are difficult to classify as policy positions. His uploaded platform shows genuine passion for workplace and small business issues despite occasional incoherence. Score reflects moderate alignment on substantive points.'
  );

  const michaelEconomy = `SMALL BUSINESS & WORKPLACE POLICY — Michael Scott for City Council

Okay, so. Business. I know business. I ran the most profitable branch of Dunder Mifflin for many, many years. (Some of those years were more profitable than others. But the vibes were always exceptional.)

Here is my small business plan for Portland:

SMALL BUSINESS SUPPORT:
- Create a "World's Best Small Business" award, presented quarterly by me, personally, with a trophy that I designed
- Cut red tape for business permits. I once waited 14 weeks for a permit to install a foosball table in the break room. That is too long. My target: 2 weeks maximum
- Free business mentorship program — I will personally mentor up to 12 small business owners per year. We will do trust falls
- Micro-grants of $5,000 for businesses owned by people who are "just starting out and really trying their best"

WORKPLACE CULTURE INITIATIVE:
- Require all businesses with 10+ employees to have a Chief Happiness Officer (not an official HR requirement, more of a strongly worded suggestion)
- Annual "Dundies"-style awards ceremony for Portland workers, funded by the city
- Mental health days: 3 additional paid days off per year, mandated citywide

WHAT I HAVE LEARNED FROM BUSINESS:
The key to success is making your employees feel like family. Not a weird family. A fun family. Like the Huxtables before everything happened.

I am Michael Scott and I approved this message. That's what she said.`;

  insertContext.run(randomUUID(), michaelId, 'manual', 'Economic Policy (Draft 7, Final Final).txt', michaelEconomy, JSON.stringify(['economy', 'local-business']), hash(michaelEconomy));

  const michaelHousing = `HOUSING POLICY — Michael Scott for City Council

Housing. Big topic. I actually lived in my office for a while, so I understand housing insecurity on a personal level.

KEY POSITIONS:

AFFORDABLE HOUSING: Yes, we need it. I support building more of it. Specifically the kind where people can afford it. That is the whole point.

RENT CONTROL: Complicated. My accountant, Oscar Martinez, says rent control has mixed economic evidence. My friend Kevin says "just make it cheaper, Michael." I am somewhere in between Kevin and Oscar, but closer to Kevin on this one.

ZONING REFORM: Allow more density in single-family neighborhoods. This is good. More neighbors means more people to invite to things.

LANDLORD ACCOUNTABILITY: Landlords must maintain their properties. This is basic. I once had a landlord who refused to fix the heat. His name was... actually I'm not going to say his name. But he knows who he is.

COMMUNITY VISION: I want Portland to be a place where anyone can afford to live. That's the dream. Not everyone can manage a paper company branch, but everyone deserves a home.

— Michael Scott, Your Future City Council Member and also currently the World's Best Candidate (self-awarded, trophy available for viewing upon request)`;

  insertContext.run(randomUUID(), michaelId, 'manual', 'Housing (I Talked to Oscar About This).txt', michaelHousing, JSON.stringify(['housing', 'economy']), hash(michaelHousing));

  insertBlocked.run(randomUUID(), michaelId, 'HR complaints', 'HR matters are handled by Toby Flenderson, and I don\'t want to talk about Toby. Please contact my office for anything serious. Toby, if you\'re reading this, stop.', null);

  // ─────────────────────────────────────────────
  // 4. TED LASSO — School Board
  // ─────────────────────────────────────────────
  const tedId = randomUUID();
  const tedHash = bcrypt.hashSync('password123', 10);
  insertCandidate.run(
    tedId,
    'ted.lasso@believepdx.com',
    tedHash,
    'Ted Lasso',
    'School Board District 4',
    'local',
    'Portland Public Schools District 4',
    JSON.stringify(['97211', '97212', '97213', '97217']),
    'Believe Party',
    'Former AFC Richmond head coach and Kansas native who fell in love with this community the same way he falls in love with every community — immediately, completely, and with a plate of homemade biscuits. Believe.',
    JSON.stringify({
      tone: 'warm, optimistic, full of folksy wisdom and sports metaphors',
      style_guidelines: 'Use football (soccer) metaphors for education policy. Reference personal growth constantly. Quote Walt Whitman or Roy Kent occasionally. Express genuine belief in every child\'s potential. Bring up biscuits when appropriate. Be vulnerable about your own learning journey.',
      key_phrases: ['Believe', 'be curious, not judgmental', 'taking on a challenge is a lot like riding a horse', 'the truth will set you free, but first it will piss you off', 'goldfish']
    }),
    'https://believe-pdx.example.com/donate',
    1,
    88.5,
    'Ted Lasso\'s platform is remarkably coherent and reflects his well-documented public commitment to youth development, mental health, and inclusive community building. Minor gaps in technical education policy detail, offset by exceptional alignment on core values.'
  );

  const tedEducation = `EDUCATION PLATFORM — Ted Lasso for School Board

You know, someone told me I was crazy to run for school board. Didn't know the system, didn't know the players, didn't even know the rules were different from American football. You know what I said? I said, "Be curious, not judgmental."

That's what I want for every kid in Portland Public Schools District 4.

CORE BELIEFS:

1. EVERY STUDENT IS A GOLDFISH
You know what I love about goldfish? They got like a ten-second memory. Every time they swim around that bowl, it's brand new. Every day is a fresh start. That's how I want our kids to feel walking into school. Whatever happened yesterday? That's gone. Today is new.

2. MENTAL HEALTH FIRST
I'm gonna be honest with you. I went through a hard time. I'm not too proud to say it. We need a school counselor in every school — not shared between five schools, in every single school. Mental health is health. Full stop.

SPECIFIC POLICY POSITIONS:

COUNSELOR RATIO: Current ratio is 1 counselor per 480 students. National recommendation is 1 per 250. I'm pushing to get to 1 per 300 within three years. This is fundable. I did the math. Well, Beard did the math, but I reviewed it.

YOUTH SPORTS FUNDING: Restore full funding to all extracurricular sports programs. Sports aren't just about winning — they're about learning to be a team. I know a little something about that.

ARTS EDUCATION: Double the arts budget. Music, theater, visual arts. A kid who learns to play guitar isn't just learning music — they're learning discipline, creativity, and how to be comfortable being vulnerable. That's a life skill.

TEACHER PAY: Portland teachers deserve to be paid like the professionals they are. I want to work with the district to increase starting teacher salaries by 15% over four years.

READING BY THIRD GRADE: Every student reading at grade level by the end of third grade. I will personally read to classrooms if that helps. I am a very good reader.

I believe in these kids. I believe in this community. And I believe in you.

— Ted`;

  insertContext.run(randomUUID(), tedId, 'manual', 'Ted Lasso Education Platform - BELIEVE.txt', tedEducation, JSON.stringify(['education', 'healthcare']), hash(tedEducation));

  const tedMentalHealth = `MENTAL HEALTH & YOUTH SERVICES — Ted Lasso for School Board

I'm gonna tell you something Walt Whitman once said. He said, "Be curious, not judgmental." Walt Whitman said that. Or someone like Walt Whitman. The point is — it's a good quote.

YOUTH MENTAL HEALTH INITIATIVE:

- Hire 12 new full-time school counselors across District 4 within two years
- Launch "Believe" peer support program: trained student mental health ambassadors in every middle and high school
- Partner with OHSU to provide free therapy referrals for students without insurance
- Mandatory mental health first aid training for all teachers and staff
- Anonymous reporting system so students can flag concerns about themselves or friends without fear

AFTER-SCHOOL PROGRAMMING:

- Expand after-school programs until 6 PM at all district schools (currently only available at 4 of 11 schools)
- Free summer enrichment programs for students who need extra support
- Mentorship program pairing students with local professionals

ANTI-BULLYING:

I've dealt with locker room culture my whole career. Mean stuff happens. The answer isn't zero tolerance policies that get kids expelled — the answer is building a culture where cruelty isn't cool. We do that by making kindness visible. We celebrate it. We make heroes out of the kids who stick up for each other.

FAMILY ENGAGEMENT:

Parents are the first coaches. We partner with them, communicate with them, and make them feel welcome in schools. Translation services at every school event. Evening meetings, not just 3 PM. Biscuits. (I will literally bring biscuits to parent nights. This is a real offer.)

Believe.`;

  insertContext.run(randomUUID(), tedId, 'manual', 'Mental Health & Youth Services Platform.txt', tedMentalHealth, JSON.stringify(['healthcare', 'education', 'civil-rights']), hash(tedMentalHealth));

  // ─────────────────────────────────────────────
  // 5. DAENERYS TARGARYEN — State House
  // ─────────────────────────────────────────────
  const daenerysId = randomUUID();
  const daenerysHash = bcrypt.hashSync('password123', 10);
  insertCandidate.run(
    daenerysId,
    'daenerys.targaryen@breakthewheel.com',
    daenerysHash,
    'Daenerys Targaryen',
    'State House District 44',
    'state',
    'Oregon House District 44 (Portland Northeast)',
    JSON.stringify(['97211', '97212', '97217', '97218']),
    'Progressive',
    'Stormborn. Breaker of Chains. First of Her Name. Former Queen of Meereen, Khaleesi of the Great Grass Sea. Has three dragons (emotional support animals). Running for Oregon State House on a platform of breaking systemic wheels everywhere she finds them. Has a complicated relationship with advisors.',
    JSON.stringify({
      tone: 'regal, passionate, occasionally prone to escalation, but genuinely committed to liberation',
      style_guidelines: 'Refer to yourself with occasional use of titles. Use "breaking the wheel" as a metaphor for systemic reform. Express deep conviction. Reference your dragons obliquely ("I have resources at my disposal"). Be inspiring but occasionally ominous.',
      key_phrases: ['break the wheel', 'I am not here to stop the wheel from spinning', 'I was born to rule', 'dracarys (metaphorically)', 'the people deserve better than the old way']
    }),
    'https://breakthewheel-pdx.example.com',
    1,
    76.0,
    'Daenerys Targaryen\'s platform is ambitious and broadly aligns with her public advocacy for systemic reform. Alignment score docked slightly due to some ambiguity about her position on institutional oversight and a notable incident in Meereen that public records suggest may not be fully reflected in her uploaded platform.'
  );

  const daenerysEconomy = `ECONOMIC JUSTICE PLATFORM — Daenerys Targaryen for Oregon State House

I did not come to Portland to be part of the wheel. I came to break it.

For too long, the same families, the same donors, the same entrenched interests have controlled Oregon's economic policy. They say this is just the way things are. I say: it is the way things have been. It does not have to be the way things will be.

THE WHEEL I INTEND TO BREAK:

HOUSING: The housing crisis is a wealth transfer from the poor to the landlord class. My plan:
- Vacancy tax on properties left empty for more than 90 days
- State-funded social housing program: publicly owned, permanently affordable units
- Renter protections including just-cause eviction requirements statewide
- Ban on hedge fund ownership of single-family homes

WAGES: A worker who cannot afford rent in the city where they work is not free. They are a different kind of chain.
- Raise the Oregon minimum wage to $22/hour over three years
- Require profit-sharing for any company receiving state tax incentives
- Strengthen collective bargaining rights

ENERGY: I have a deep personal relationship with fire. (This is metaphorical. Mostly.) My energy platform:
- 100% renewable electricity by 2035
- End new fossil fuel infrastructure permits immediately
- Green jobs training program: 10,000 Oregonians retrained for clean energy work by 2030
- Community ownership of energy infrastructure in low-income neighborhoods

THE OLD FAMILIES — the donors, the lobbyists, the people who think government exists to protect their wealth — they will tell you my plans are radical. They said the same thing in Essos. We broke those wheels too.

I will not stop the wheel from spinning. I am here to break the wheel entirely.`;

  insertContext.run(randomUUID(), daenerysId, 'manual', 'Break the Wheel - Economic Platform.txt', daenerysEconomy, JSON.stringify(['economy', 'housing', 'environment', 'taxes']), hash(daenerysEconomy));

  const daenerysJustice = `CRIMINAL JUSTICE & CIVIL RIGHTS — Daenerys Targaryen for Oregon State House

I have seen what chains look like. I have freed slaves on three continents. (Two continents. The third was complicated.) I know what liberation looks like, and I know what it costs.

Oregon's criminal justice system perpetuates a cycle that punishes poverty and calls it justice. I will end that cycle.

POLICE ACCOUNTABILITY:
- Independent oversight board with subpoena power for all law enforcement agencies
- End qualified immunity for Oregon officers
- Mandatory body cameras, all footage publicly available within 72 hours absent active investigation
- Demilitarize police departments: surplus military equipment returned

CRIMINAL JUSTICE REFORM:
- End mandatory minimums for non-violent drug offenses
- Decriminalize personal use quantities of all substances (treatment, not incarceration)
- Eliminate cash bail — you should not sit in jail because you are poor
- Automatic expungement of all marijuana convictions

CIVIL RIGHTS:
- Strengthen Oregon's anti-discrimination laws to explicitly cover all housing, employment, and public accommodations
- Establish a state reparations study commission
- Protect reproductive rights in Oregon constitution permanently

A NOTE ON DRAGONS: I have been asked about my dragons. They are a private matter. What I will say is this: every leader needs tools at their disposal. Mine happen to be extraordinary. I use them responsibly. Mostly.

The chains are everywhere, if you know how to look. I know how to look. I have always known.

— Daenerys Stormborn, First of Her Name`;

  insertContext.run(randomUUID(), daenerysId, 'manual', 'Justice Platform - Break Every Chain.txt', daenerysJustice, JSON.stringify(['civil-rights', 'public-safety', 'healthcare']), hash(daenerysJustice));

  insertBlocked.run(
    randomUUID(), daenerysId,
    "King's Landing incident",
    'I prefer to focus on my forward-looking policy agenda. For questions about past governance decisions, I would direct you to the full historical record, which I believe speaks for itself in context.',
    null
  );

  // ─────────────────────────────────────────────
  // 6. RAYMOND HOLT — Public Safety Commissioner
  // ─────────────────────────────────────────────
  const holtId = randomUUID();
  const holtHash = bcrypt.hashSync('password123', 10);
  insertCandidate.run(
    holtId,
    'raymond.holt@ninenineninetynine.com',
    holtHash,
    'Raymond Holt',
    'Public Safety Commissioner',
    'local',
    'Portland Metropolitan Area',
    JSON.stringify(['97211', '97212', '97214', '97217', '97218']),
    'Independent',
    'Captain of the 99th Precinct, Brooklyn (retired). 35 years in law enforcement. First openly gay Black police captain in NYPD history. Brought the 99th from worst to first in arrest rates through data, discipline, and an unwavering commitment to the rule of law. Pronouns: he/him. Favorite word: "bone." Dislikes: poor grammar, inefficiency, and Kevin (personally, not professionally).',
    JSON.stringify({
      tone: 'extremely formal, affectless, precise, and occasionally cryptic',
      style_guidelines: 'Speak in complete, grammatically perfect sentences. Express no emotion whatsoever on the surface. Make profoundly formal statements about mundane things. Occasionally reveal unexpected depth. Never use contractions. Reference the "Nine-Nine" methodology for problem-solving.',
      key_phrases: ['I am your Public Safety Commissioner', 'this is a fact', 'the data supports this conclusion', 'bone', 'the nine-nine methodology']
    }),
    'https://holt2026.example.com',
    1,
    94.0,
    'Raymond Holt\'s platform alignment is among the highest of any candidate reviewed. His public record of evidence-based policing reforms aligns precisely with his uploaded policy documents. The only discrepancy noted: his public statements occasionally reference "the Nine-Nine" in ways that suggest organizational attachment not fully captured in the platform text.'
  );

  const holtPublicSafety = `PUBLIC SAFETY PLATFORM — Raymond Holt for Portland Public Safety Commissioner

I will now present my public safety platform. I will do so in a clear, organized, and grammatically correct manner. You are welcome.

CORE PHILOSOPHY:
Public safety is not a feeling. It is a measurable outcome produced by specific, evidence-based interventions applied with consistency and accountability. I do not deal in feelings. I deal in results.

LAW ENFORCEMENT REFORM:
1. DATA-DRIVEN DEPLOYMENT: Officers deployed based on crime pattern analysis, not intuition. Intuition is a poem. Data is a fact.

2. CIVILIAN OVERSIGHT: An independent civilian review board with real authority. Not advisory. Real authority. There is a difference between those two things and I am comfortable explaining it at length.

3. DE-ESCALATION TRAINING: 40 hours of mandatory annual de-escalation training for all sworn officers. This is not optional. Nothing about public safety should be optional except crime, which should be discouraged.

4. DIVERSITY IN LEADERSHIP: I became the first openly gay Black captain in NYPD history. It was difficult. It was also correct. Portland's public safety leadership should reflect Portland's community. This is not a political statement. It is a logical one.

5. MENTAL HEALTH CO-RESPONSE: Partner trained mental health professionals with officers on all calls involving mental health crises. This reduces harm. The data supports this. I have the data.

COMMUNITY POLICING:
The relationship between law enforcement and community is transactional only in the worst departments. In the best departments — in the Nine-Nine, for example — it is a partnership. Officers know their neighborhoods. Neighbors trust their officers. This does not happen by accident.

I will make it happen by design.

RESPONSE TIMES: Current average: 7.2 minutes. My target: 5.5 minutes. I have a plan. It involves 14 specific operational changes, which I will enumerate if asked.

— Raymond Holt. This is a fact.`;

  insertContext.run(randomUUID(), holtId, 'manual', 'Public Safety Platform (Final, Not A Draft).txt', holtPublicSafety, JSON.stringify(['public-safety', 'civil-rights']), hash(holtPublicSafety));

  const holtCommunity = `COMMUNITY & SOCIAL SERVICES — Raymond Holt for Public Safety Commissioner

I am aware that public safety extends beyond policing. I have read the research. All of it.

VIOLENCE PREVENTION:
- Invest $8M in community violence interruption programs. These programs work. I have reviewed 34 peer-reviewed studies.
- Expand youth diversion programs: first-time nonviolent juvenile offenders directed to services, not detention.
- Fund 6 community centers in high-need neighborhoods. Idle youth are a public safety issue. Engaged youth are a public safety asset.

HOMELESSNESS & PUBLIC SAFETY:
Homelessness is not a criminal matter. It is a housing and mental health matter. I will work with the housing commissioner (whoever that is — Leslie Knope, I've heard, which is concerning from an enthusiasm standpoint but promising from a competence standpoint) to address root causes.

SUBSTANCE USE:
Addiction is a medical issue. I have watched officers arrest the same individuals dozens of times for substance-related offenses. This is not working. I will support treatment-based alternatives to incarceration.

A PERSONAL NOTE:
I was asked to include something "personal" in this document to seem "relatable." Very well. My husband Kevin makes an exceptional pernil. I find cooking to be a meditative activity. Cheddar, my dog, is named after cheese. I am told this section was "charming." It was not intended to be charming. It was intended to be accurate.

— Raymond Holt`;

  insertContext.run(randomUUID(), holtId, 'manual', 'Community Safety & Services Platform.txt', holtCommunity, JSON.stringify(['public-safety', 'healthcare', 'housing']), hash(holtCommunity));

  console.log('\n✓ Demo candidates seeded for ZIP 97211:\n');
  console.log('  leslie.knope@pawneegov.com              / password123  (City Council, 97.5%)');
  console.log('  ron.swanson@notthegovernment.com        / password123  (Mayor, 71%)');
  console.log('  michael.scott@worldsbestcandidate.com  / password123  (City Council At-Large, 58%)');
  console.log('  ted.lasso@believepdx.com               / password123  (School Board, 88.5%)');
  console.log('  daenerys.targaryen@breakthewheel.com   / password123  (State House, 76%)');
  console.log('  raymond.holt@ninenineninetynine.com    / password123  (Public Safety Commissioner, 94%)');
}

module.exports = seed;

// Run directly if called via CLI
if (require.main === module) {
  seed();
}
