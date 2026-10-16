# TownHall AI: Design handover for Claude Design

Oct 16, 2026 · Prash Pek

Editable source: the Claude Doc "TownHall AI: Design handover for Claude Design". This file is a copy for pulling from the repo.

## The product and the brief

TownHall AI helps an Oregon voter fill out their mail-in ballot in line with their own values, without hours of research. It is live at [townhallai.outsetinno.com](https://townhallai.outsetinno.com) for the November 3, 2026 general election.

The core use case, in the owner's words: "I'm sitting down at my table to vote in Oregon. I have a mail-in ballot. I want to understand the best way for me to fill out my ballot that's aligned with my political values without spending hours and hours on research."

The product is a guided walk through the voter's ballot, top to bottom, ending in a printable cheat sheet. Every screen informs; the product never picks for the voter. The ballot has only two kinds of items: **races** (offices with candidates) and **measures** (yes/no questions).

What we want from Claude Design, in order:

1. A homepage flow diagram that shows a first-time visitor the whole experience before they start (the first ask, below).
2. A refined design system and screen designs for the whole app as we keep building it, not just the homepage (see App-wide design asks), kept within the rules in this doc.

## First ask: the homepage flow diagram

Design a simple "How it works" diagram for the homepage so a visitor knows what they are getting into before they type an address. It should read in a few seconds, show six steps in order, and mark the values quiz as optional.

**Where it sits.** The homepage today (`app/page.tsx`) is one column (max width 768 px): an eyebrow line, the headline "Get ready to fill out your Oregon ballot", a gold rule, one paragraph, then a card with the address field, state picker and a Start button, then a "Just browse" link. The diagram goes between the intro paragraph and the address card, or directly under the card. Please show which you recommend.

**Step copy** (edit freely, but keep the meaning):

| # | Step | One line under it |
| --- | --- | --- |
| 1 | Tell us where you live | Your address suggests the races and measures on your ballot. We use it once, then throw it away. |
| 2 | Check your ballot | Hold your paper ballot next to the screen. Remove anything that isn't on it and add anything that's missing. |
| 3 | Take the values quiz (optional) | About 5 minutes of agree or disagree statements drawn from your own ballot. Skip it if you like. |
| 4 | Discuss each race and measure | Ask questions and hear from every candidate, or from both YES and NO, using only our cited sources. |
| 5 | Make your own choice | Pick a candidate, YES or NO, or mark it undecided. Nothing is chosen for you. |
| 6 | Print your summary | One page of your choices in ballot order, ready to fill out your mail-in ballot from. |

**Requirements**

- Works at phone width (375 px) and desktop. A vertical stepper on mobile is fine; a horizontal flow on desktop is welcome if the labels stay readable.
- Steps 3 and 4 must not look like they favour any answer. No checkmarks next to candidates, no YES/NO colours.
- Built from HTML and CSS (Tailwind), not an image, so the copy can change and screen readers read it as an ordered list.
- Small line icons per step are welcome if they are neutral (a house or pin, a ballot, a slider, speech bubbles, a pen, a printer). No flags, elephants, donkeys or party symbols.

A rough sketch of the intended order (a wireframe, not a style):

```
[1 Address] → [2 Your ballot] → [3 Values quiz]  → [4 Discuss] → [5 Your choice] → [6 Summary]
 finds ballot   check and edit    optional, dashed   hear every     you decide        print, fill in
                                                      side  ↑______________↓
                                                      repeat for every race and measure
```

Steps 4 and 5 repeat for each item on the voter's ballot; the quiz is optional.

## The full voter flow, screen by screen

Five screens carry the whole experience. Two are live in a plain first version; the quiz and the discussion panel are being built, so their designs are the most open.

| Screen | URL | What's on it | Status |
| --- | --- | --- | --- |
| Start | `/` | Headline, address field, state picker (Oregon default), Start, "Just browse". | Live |
| Your ballot | `/ballot` | Suggested races and measures in printed-ballot order (federal, state, county, city, local, then measures by number). Remove any item, "+ Add an item" searches all races and measures, "may apply" special districts at the end, link to Oregon My Vote. One button: "This matches my ballot". | Live |
| Values quiz (optional) | not yet | One statement per screen with a progress bar. Agree/disagree on 5 points, plus "how much does this matter to you" (low, medium, high). 10 to 15 statements, all drawn from this voter's ballot. "Skip" goes straight to the walk-through. | Being built |
| Item page (race or measure) | `/races/[slug]`, `/measures/[slug]` | "Item 3 of 14" with Previous/Next. Race: what the office does, one equal-sized card per candidate in ballot order (badge, party, two-line bio, the voter's Alignment with reasons and sources, an "Endorsed by" dropdown). Measure: plain summary, what YES does and what NO does side by side, fiscal impact, arguments for and against with sources. A discussion panel on the same page. "Your choice for this item" at the bottom: each option plus Undecided and Skip, nothing preselected. | Live without discussion; discussion being built |
| Ballot summary | `/ballot/summary` | One page in ballot order to sit next to the paper ballot: each item's title, the voter's own choice or "Undecided" (with a Go back link), Alignment, two or three lines from their discussion. Print, "Save to my account" (opt-in), return deadline, drop box locator, Oregon My Vote. | Live (basic) |

**The discussion panel is the core feature.** For each item the voter types a question, and every candidate answers (or the YES side and the NO side for a measure), each grounded only in our collected sources, with citations and a source excerpt on tap. Starter questions come from the voter's quiz answers. Unclaimed candidates are written about in the third person. If our sources don't cover a question, the answer says so rather than guessing. Every side gets equal space and the same visual weight.

**Vocabulary to use in the UI.** "Alignment" is how the voter's quiz answers line up with a candidate or measure side, always shown with reasons. "Reflection score" is how faithfully a candidate's profile reflects their public record; unclaimed profiles show "Public record only" instead of a number. Don't use "match", "issues" or "top 3".

## Design system

The look is a calm civic serif on cream, carried over from v1 with red and blue removed. Keep these tokens unless you propose a change and say why. They live in `app/globals.css` under `@theme`.

| Token | Hex | Use |
| --- | --- | --- |
| cream | `#FAFAF7` | Page background |
| paper | `#FFFFFF` | Cards, header |
| ink (charcoal) | `#1F2328` | Text, primary buttons, borders on focus |
| muted | `#5B6168` | Secondary text, eyebrow labels |
| line | `#E4E2DA` | Card borders, dividers |
| gold | `#D97706` | Accent: rule under headings, link underline |
| gold-soft | `#FDF3E3` | Gold tint backgrounds |
| olive | `#4D5B2F` | Secondary accent, button hover |
| olive-soft | `#EEF1E6` | Olive tint backgrounds |
| warn (amber) | `#B45309` | Warnings, errors, "Preview" tags |

**Type.** Playfair Display (600, 700) for headings; DM Sans Variable for body and UI.

**Components that exist today**

- Gold rule: 48 × 2 px bar under page headings.
- Eyebrow: small uppercase label, 12 px, semibold, wide letter spacing, muted.
- Card: square corners, 1 px line border, white fill, 16 px padding.
- Primary button: charcoal fill, cream text, square, turns olive on hover. Secondary button: charcoal outline that fills on hover.
- Link: underlined in gold, 2 px, turns olive on hover.
- Input: square, line border, charcoal border on focus.
- Header: logo plus "TownHall AI" wordmark on the left, "My ballot" and sign-in on the right. Footer: the nonpartisan disclaimer on every page.

Kept from v1: square cards, small uppercase labels, the gold heading rule, one question per screen with a progress bar, the chat's empty state and typing dots. Dropped from v1: the email gate, "Strong Match" labels and browse-by-issue.

## App-wide design asks

The homepage is the first deliverable, but we want a system the whole app grows into. For each area below, please recommend a layout and the reusable components it needs. The quiz and the discussion panel are the most open.

| Area | Today | What we want designed |
| --- | --- | --- |
| Navigation and progress | Header with logo, "My ballot", sign-in | A light step indicator across the flow (Ballot, Quiz, Items, Summary), the "Item 3 of 14" pattern with Previous/Next, and a mobile header. |
| Your ballot | Plain list with remove and add | Items grouped by level in printed-ballot order, a search to add any item, the "may apply" section, undo after remove, and the state when an address finds nothing. |
| Values quiz | Not built | One statement per screen: a 5-point agree/disagree scale, a low/medium/high importance control, progress, Skip. No ideology result screen at the end; it hands straight to the first item. |
| Race page | Basic candidate cards | An equal-weight candidate card that works for 1 to 10+ candidates, with the badge (Claimed and verified / Public record only), Reflection score, party, short bio, Alignment reasons with sources, and an "Endorsed by" dropdown. A small "Are you this candidate? Let us know" link. |
| Measure page | Basic summary and arguments | YES and NO side by side in identical styling, fiscal impact, arguments with sources, and a clear state when one side filed nothing. |
| Discussion panel | Not built | Question box, starter questions, one answer per candidate or side in equal columns or cards, citations with a source excerpt on tap, a "our sources don't cover this" answer, a typing state, and a mobile layout (stacked or tabbed). |
| Your choice | Radio buttons | A choice control with each option plus Undecided and Skip, nothing preselected, with a saved state. |
| Ballot summary | Basic list | A cheat sheet that sits next to the paper ballot, flags undecided items, prints in black and white on letter paper, and shows deadlines and official links. |
| Accounts and privacy | Sign-in only | The opt-in "Save to my account" moment with a plain privacy note; signing in must never be required to use the app. |
| System states | Ad hoc | Loading, empty, error, not found, and the "Preview" tag for unpublished content. |

**Shared patterns to define once and reuse**

- Citation: an inline source marker that opens the verbatim excerpt and the link.
- Equal comparison layout: one component for N candidates or two measure sides, so equal space is built in rather than remembered.
- Badges and tags: claim status, Optional, Preview, Undecided.
- Alignment display: reasons first, shown per candidate or side, never as a ranking or a winner.
- A small neutral icon set for the steps and states.
- Voice and microcopy: plain, warm, second person, short sentences, no jargon ("ballot item" is fine; "contest" isn't).

**Later (phase 2), direction only:** candidates will claim their profile, choose first or third person, and upload sources. No screens needed yet, but the card and badge designs should leave room for a claimed, first-person profile.

## Neutrality rules (non-negotiable)

Voters must trust that the product doesn't lean. Any design that breaks one of these gets rejected, however good it looks.

- **No red or blue anywhere**, including icons, charts, illustrations and hover states.
- **YES/NO and parties are never colour-coded.** YES and NO use the same colour, size and weight; the same goes for every candidate.
- **Equal space per candidate and per measure side.** Same card size, same order logic (printed ballot order), no "featured" candidate.
- **Nothing is preselected or recommended.** No default choice, no "best match" highlight, no ranking by Alignment.
- **No left/right labels.** Quiz statements are plain sentences; there is no ideology scale or spectrum graphic.
- **Endorsements are shown, never scored.** The "Endorsed by" dropdown starts collapsed and never feeds Alignment.
- **Sources are always one tap away.** Every claim, answer and argument carries a citation; a missing side is stated plainly ("No argument against was filed").
- **Privacy is visible.** The address is used once and thrown away; choices stay in the browser unless the voter opts in to save them. Say so in the UI where it matters.
- The footer disclaimer stays on every page.

## Build constraints and what to hand back

Designs will be built in the existing app, so they should map onto what it already uses.

- **Stack:** Next.js 16 (App Router, React server components), Tailwind CSS v4 with the tokens above defined in `app/globals.css` under `@theme`. Plain HTML and Tailwind classes; no new UI library.
- **Layout:** single centred column, max width 768 px, 16 px side gutter. Must work at 375 px with no horizontal scroll.
- **Accessibility:** WCAG AA contrast (check gold text on cream; gold is used for rules and underlines, not body text), visible focus states, real headings and lists.
- **Print:** the ballot summary must print cleanly on letter paper in black and white; header and footer are hidden in print.
- **Light theme only** for now.

**Please hand back**

1. The homepage with the flow diagram, at phone and desktop widths, with your placement recommendation.
2. Any changes you propose to the tokens or components, with the reason.
3. Recommendations for every area in App-wide design asks, with the shared components defined once. Start with the item page and discussion panel (race and measure versions) and the quiz, since those are next to be built and the least designed.

Share the result as a Claude Design link; the build side can import it from there.

**Where to look in the repo:** `app/globals.css` (tokens and components), `app/page.tsx` (homepage), `app/ballot/` (ballot and summary), `app/races/[slug]` and `app/measures/[slug]` (item pages), `components/` (header, footer, ballot pieces).
