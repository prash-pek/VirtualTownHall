# Technical Requirements Document

# TownHall AI
*AI-Powered Candidate Communication Platform*

| | |
|---|---|
| **Version** | 1.0 — MVP |
| **Date** | February 28, 2026 |
| **Source PRD** | TownHall_AI_PRD_v1 |
| **Target Build** | 2-Hour Claude Code Sprint |

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│              React (Vite) + Tailwind CSS                 │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Candidate   │  │ Constituent  │  │    Shared      │  │
│  │  Admin Panel │  │  Chat & Discovery │  │  Components │  │
│  └──────┬───────┘  └──────┬───────┘  └───────────────┘  │
└─────────┼─────────────────┼─────────────────────────────┘
          │ REST API        │ REST API + WebSocket
          ▼                 ▼
┌─────────────────────────────────────────────────────────┐
│                  API SERVER (Backend)                     │
│            Node.js (Express) or Python (FastAPI)         │
│  ┌────────────┐ ┌────────────┐ ┌──────────────────────┐ │
│  │  Auth       │ │  Candidate │ │  Conversation        │ │
│  │  Module     │ │  Manager   │ │  Engine              │ │
│  └────────────┘ └────────────┘ └──────────┬───────────┘ │
│  ┌────────────┐ ┌────────────┐            │             │
│  │  Analytics  │ │  Audit     │            │             │
│  │  Engine     │ │  Logger    │            │             │
│  └────────────┘ └────────────┘            │             │
└───────────┬───────────────────────────────┼─────────────┘
            │                               │
            ▼                               ▼
┌──────────────────────┐      ┌──────────────────────────┐
│   SQLite Database    │      │     Claude API           │
│  (PostgreSQL-ready   │      │  Sonnet → Chat           │
│   schema)            │      │  Opus → Alignment Score  │
└──────────────────────┘      └──────────────────────────┘
            │
            ▼
┌──────────────────────┐
│   Local File Storage │
│  (S3-ready path      │
│   abstraction)       │
└──────────────────────┘
```

### 1.2 Technology Stack

| Layer | Technology | MVP | Production Migration |
|---|---|---|---|
| **Frontend** | React 18+ with Vite | Single-page application | No change |
| **Styling** | Tailwind CSS | Utility-first CSS | No change |
| **Backend** | Node.js (Express) or Python (FastAPI) | REST API server | No change |
| **Database** | SQLite | Single-file DB | PostgreSQL |
| **AI Chat** | Claude API (Sonnet) | Direct API calls | Add streaming, caching |
| **AI Scoring** | Claude API (Opus) | Background job on save | Queue-based processing |
| **File Storage** | Local filesystem | `/uploads` directory | S3-compatible storage |
| **Text Extraction** | pdf-parse, mammoth.js | Synchronous on upload | Async worker |
| **Auth** | Custom (bcrypt + JWT) | Stateless tokens | OAuth / SSO provider |
| **Web Search** | Claude web search tool | Alignment score only | Dedicated scraping service |

---

## 2. Database Schema

### 2.1 Entity Relationship Diagram

```
┌──────────────┐       ┌───────────────────┐
│  Candidate   │──────<│ CandidateContext   │
│              │       └───────────────────┘
│              │──────<┌───────────────────┐
│              │       │ BlockedTopic      │
│              │       └───────────────────┘
│              │──────<┌───────────────────┐
│              │       │ Conversation      │>──────┌──────────────┐
│              │       └───────────────────┘       │ Constituent  │
│              │──────<┌───────────────────┐       └──────────────┘
│              │       │ AuditLog          │
└──────────────┘       └───────────────────┘
```

### 2.2 Table Definitions

#### `candidates`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT (UUID) | PRIMARY KEY | Unique candidate identifier |
| `email` | TEXT | UNIQUE, NOT NULL | Login email |
| `password_hash` | TEXT | NOT NULL | bcrypt hashed password |
| `name` | TEXT | NOT NULL | Candidate display name |
| `office` | TEXT | NOT NULL | Office being sought (e.g., "City Council Ward 3") |
| `election_level` | TEXT | NOT NULL, CHECK IN ('local', 'state', 'national') | Tier of election |
| `district` | TEXT | NOT NULL | District or geographic area |
| `zip_codes` | TEXT (JSON array) | NOT NULL | ZIP codes this candidate's district covers |
| `party` | TEXT | | Party affiliation |
| `bio` | TEXT | | Candidate biography |
| `persona_config` | TEXT (JSON) | | Tone, style, key phrases, personality instructions |
| `donation_url` | TEXT | | External donation page URL |
| `is_verified` | INTEGER | DEFAULT 0 | Admin-set verification flag (0/1) |
| `is_paused` | INTEGER | DEFAULT 0 | Global kill switch (0/1) |
| `alignment_score` | REAL | | 0.0–100.0 alignment percentage |
| `alignment_rationale` | TEXT | | AI-generated explanation of score |
| `created_at` | TEXT (ISO 8601) | DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | TEXT (ISO 8601) | DEFAULT CURRENT_TIMESTAMP | |

#### `candidate_contexts`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT (UUID) | PRIMARY KEY | |
| `candidate_id` | TEXT | FOREIGN KEY → candidates.id, NOT NULL | |
| `content_type` | TEXT | NOT NULL, CHECK IN ('document', 'manual') | Source type |
| `original_filename` | TEXT | | Original uploaded filename (documents only) |
| `content_text` | TEXT | NOT NULL | Extracted/entered text content |
| `topic_tags` | TEXT (JSON array) | DEFAULT '[]' | Topic categorization tags |
| `content_hash` | TEXT | NOT NULL | SHA-256 hash of content_text |
| `is_active` | INTEGER | DEFAULT 1 | Soft delete flag |
| `created_at` | TEXT (ISO 8601) | DEFAULT CURRENT_TIMESTAMP | |

**Index:** `candidate_id`, `is_active`

#### `blocked_topics`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT (UUID) | PRIMARY KEY | |
| `candidate_id` | TEXT | FOREIGN KEY → candidates.id, NOT NULL | |
| `topic` | TEXT | NOT NULL | Topic keyword or phrase |
| `redirect_message` | TEXT | | Message shown to constituent when topic is raised |
| `redirect_url` | TEXT | | URL to predefined materials |
| `is_active` | INTEGER | DEFAULT 1 | Can be toggled (kill switch per topic) |
| `created_at` | TEXT (ISO 8601) | DEFAULT CURRENT_TIMESTAMP | |

**Index:** `candidate_id`, `is_active`

#### `constituents`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT (UUID) | PRIMARY KEY | |
| `email` | TEXT | UNIQUE, NOT NULL | Login email |
| `zip_code` | TEXT | NOT NULL | Self-reported ZIP code |
| `interest_tags` | TEXT (JSON array) | DEFAULT '[]' | Selected topic interests |
| `created_at` | TEXT (ISO 8601) | DEFAULT CURRENT_TIMESTAMP | |

**Index:** `zip_code`

#### `conversations`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT (UUID) | PRIMARY KEY | |
| `candidate_id` | TEXT | FOREIGN KEY → candidates.id, NOT NULL | |
| `constituent_id` | TEXT | FOREIGN KEY → constituents.id, NULLABLE | NULL for anonymous |
| `is_anonymous` | INTEGER | NOT NULL, DEFAULT 1 | Whether analytics are tracked |
| `messages` | TEXT (JSON array) | NOT NULL, DEFAULT '[]' | Array of {role, content, timestamp} |
| `summary` | TEXT | | AI-generated conversation summary |
| `topic_tags` | TEXT (JSON array) | DEFAULT '[]' | Extracted topics from conversation |
| `message_count` | INTEGER | DEFAULT 0 | Total messages in conversation |
| `created_at` | TEXT (ISO 8601) | DEFAULT CURRENT_TIMESTAMP | |
| `ended_at` | TEXT (ISO 8601) | | When summary was generated |

**Index:** `candidate_id`, `constituent_id`, `created_at`

#### `audit_logs`

This table is **append-only**. No UPDATE or DELETE operations are permitted at the application layer.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | TEXT (UUID) | PRIMARY KEY | |
| `candidate_id` | TEXT | FOREIGN KEY → candidates.id, NOT NULL | |
| `action_type` | TEXT | NOT NULL | See action types below |
| `content_hash` | TEXT | | SHA-256 hash of affected content |
| `previous_hash` | TEXT | | Hash of previous state (for chain verification) |
| `details` | TEXT (JSON) | | Structured details of the change |
| `actor_id` | TEXT | NOT NULL | Who performed the action (candidate or admin UUID) |
| `created_at` | TEXT (ISO 8601) | DEFAULT CURRENT_TIMESTAMP | Immutable timestamp |

**Action types:** `context_added`, `context_updated`, `context_deleted`, `persona_updated`, `topic_blocked`, `topic_unblocked`, `kill_switch_activated`, `kill_switch_deactivated`, `global_pause`, `global_resume`, `verification_granted`, `verification_revoked`, `alignment_score_computed`

**Index:** `candidate_id`, `created_at`, `action_type`

### 2.3 Schema Design Notes

- **UUID generation:** Use `crypto.randomUUID()` (Node.js) or `uuid4()` (Python) for all IDs.
- **JSON columns:** Stored as TEXT in SQLite; use `JSON` type when migrating to PostgreSQL.
- **Timestamps:** ISO 8601 strings in SQLite; use `TIMESTAMPTZ` in PostgreSQL.
- **Hash chain:** Each audit log entry stores `previous_hash` pointing to the last entry for that candidate, enabling future blockchain migration by creating a verifiable chain.
- **No CASCADE deletes:** Candidates are never hard-deleted. Use `is_active` / `is_paused` flags.

---

## 3. API Specification

### 3.1 Authentication

| Endpoint | Method | Description | Auth |
|---|---|---|---|
| `POST /api/auth/candidate/register` | POST | Register a new candidate account | None |
| `POST /api/auth/candidate/login` | POST | Candidate login → JWT | None |
| `POST /api/auth/constituent/register` | POST | Register constituent (email + ZIP) | None |
| `POST /api/auth/constituent/login` | POST | Constituent login → JWT | None |

**JWT payload (candidate):** `{ id, email, role: "candidate", candidateId }`

**JWT payload (constituent):** `{ id, email, role: "constituent", zipCode }`

**Anonymous sessions:** No auth header required. Conversation requests without auth create anonymous conversations with `is_anonymous: true`.

### 3.2 Candidate Admin Endpoints

| Endpoint | Method | Description | Auth |
|---|---|---|---|
| `GET /api/candidate/profile` | GET | Get own candidate profile | Candidate |
| `PUT /api/candidate/profile` | PUT | Update profile fields | Candidate |
| `PUT /api/candidate/persona` | PUT | Update persona configuration | Candidate |
| `POST /api/candidate/context` | POST | Upload document or add manual context | Candidate |
| `GET /api/candidate/context` | GET | List all context entries | Candidate |
| `DELETE /api/candidate/context/:id` | DELETE | Soft-delete a context entry | Candidate |
| `POST /api/candidate/blocked-topics` | POST | Add a blocked topic | Candidate |
| `PUT /api/candidate/blocked-topics/:id` | PUT | Update blocked topic | Candidate |
| `DELETE /api/candidate/blocked-topics/:id` | DELETE | Remove blocked topic | Candidate |
| `POST /api/candidate/kill-switch` | POST | Activate global pause or per-topic block | Candidate |
| `DELETE /api/candidate/kill-switch` | DELETE | Deactivate global pause | Candidate |
| `GET /api/candidate/analytics` | GET | Get analytics dashboard data | Candidate |
| `GET /api/candidate/audit-log` | GET | Get audit trail | Candidate |

### 3.3 Constituent Endpoints

| Endpoint | Method | Description | Auth |
|---|---|---|---|
| `GET /api/candidates?zip=:zip` | GET | List candidates by ZIP code | None |
| `GET /api/candidates?zip=:zip&topics=:tags` | GET | Filter candidates by ZIP + topics | None |
| `GET /api/candidates/:id/profile` | GET | Get candidate public profile | None |
| `GET /api/candidates/:id/audit` | GET | Get public audit timeline | None |

### 3.4 Conversation Endpoints

| Endpoint | Method | Description | Auth |
|---|---|---|---|
| `POST /api/conversations` | POST | Start a new conversation with a candidate | None (anon) or Constituent |
| `POST /api/conversations/:id/messages` | POST | Send a message in a conversation | None or Constituent |
| `POST /api/conversations/:id/end` | POST | End conversation and generate summary | None or Constituent |
| `GET /api/conversations/:id` | GET | Get conversation history | None or Constituent |

### 3.5 Admin Endpoints

| Endpoint | Method | Description | Auth |
|---|---|---|---|
| `GET /api/admin/candidates` | GET | List all candidates | Admin |
| `PUT /api/admin/candidates/:id/verify` | PUT | Set verification badge | Admin |
| `DELETE /api/admin/candidates/:id/verify` | DELETE | Revoke verification | Admin |

### 3.6 Request/Response Schemas

#### POST `/api/conversations/:id/messages`

**Request:**
```json
{
  "content": "What is your position on affordable housing?"
}
```

**Response:**
```json
{
  "id": "msg_uuid",
  "role": "assistant",
  "content": "Based on my housing policy platform, I believe...",
  "sources": [
    {
      "context_id": "ctx_uuid",
      "excerpt": "From the candidate's Housing White Paper",
      "relevance": "direct"
    }
  ],
  "is_blocked_topic": false,
  "timestamp": "2026-02-28T14:30:00Z"
}
```

#### POST `/api/candidate/context`

**Request (document upload):**
```
Content-Type: multipart/form-data

file: [binary PDF/DOCX/TXT]
topic_tags: ["housing", "economy"]
```

**Request (manual entry):**
```json
{
  "content_type": "manual",
  "content_text": "My position on housing is...",
  "topic_tags": ["housing", "economy"]
}
```

**Response:**
```json
{
  "id": "ctx_uuid",
  "content_type": "document",
  "original_filename": "housing-policy.pdf",
  "content_hash": "sha256_hash",
  "topic_tags": ["housing", "economy"],
  "created_at": "2026-02-28T14:00:00Z",
  "alignment_score_update": {
    "status": "processing",
    "previous_score": 85.2
  }
}
```

#### GET `/api/candidate/analytics`

**Response:**
```json
{
  "total_conversations": 342,
  "authenticated_conversations": 198,
  "anonymous_conversations": 144,
  "unique_constituents": 156,
  "geographic_breakdown": {
    "97201": 45,
    "97202": 32,
    "97203": 28
  },
  "top_questions": [
    {
      "topic": "housing",
      "count": 87,
      "sample_questions": [
        "What is your plan for affordable housing?",
        "Do you support rent control?"
      ]
    },
    {
      "topic": "education",
      "count": 63,
      "sample_questions": [
        "Where do you stand on school funding?",
        "What about teacher salaries?"
      ]
    }
  ],
  "avg_messages_per_conversation": 6.4,
  "period": "all_time"
}
```

---

## 4. AI System Architecture

### 4.1 System Prompt Construction

Each conversation dynamically builds a system prompt from the candidate's configuration. The prompt is assembled in this order:

```
┌─────────────────────────────────────────────────┐
│ 1. PLATFORM PREAMBLE                            │
│    - Role definition and guardrails             │
│    - Disclaimer instructions                     │
│    - Citation format requirements                │
├─────────────────────────────────────────────────┤
│ 2. PERSONA INSTRUCTIONS                         │
│    - Candidate name and office                   │
│    - Tone and style directives                   │
│    - Key phrases and personality guidelines      │
├─────────────────────────────────────────────────┤
│ 3. BLOCKED TOPICS                               │
│    - Topic list with redirect messages           │
│    - Redirect URLs per topic                     │
│    - Instruction to gracefully deflect           │
├─────────────────────────────────────────────────┤
│ 4. CANDIDATE CONTEXT (all active entries)       │
│    - Document contents with source labels        │
│    - Manual entries with topic tags              │
│    - Instruction: ONLY use this context          │
├─────────────────────────────────────────────────┤
│ 5. GROUNDING RULES                              │
│    - Must cite source for every claim            │
│    - Must not fabricate positions                 │
│    - Fallback: "Contact the candidate's office"  │
└─────────────────────────────────────────────────┘
```

### 4.2 System Prompt Template

```
You are an AI representative of {candidate.name}, who is running for 
{candidate.office} in {candidate.district}.

IMPORTANT DISCLAIMER: You must remind users at the start of each 
conversation that you are an AI representation, not the actual candidate 
speaking. Use this exact phrasing: "I'm an AI representative of 
{candidate.name}, powered by TownHall AI. My responses are based on 
materials provided by the candidate — this is not {candidate.name} 
speaking directly."

PERSONA:
{candidate.persona_config.tone_instructions}
{candidate.persona_config.style_guidelines}
{candidate.persona_config.key_phrases}

BLOCKED TOPICS — If the user asks about any of the following, do NOT 
provide a position. Instead, redirect gracefully:
{for each blocked_topic:}
- Topic: "{topic.topic}" → Respond: "{topic.redirect_message}" 
  {if topic.redirect_url} Link: {topic.redirect_url} {endif}

CANDIDATE POSITIONS AND CONTEXT:
The following are the ONLY materials you may reference when representing 
this candidate's positions. Do not state, imply, or invent any position 
not found in these materials.

{for each context_entry:}
--- SOURCE: {context.original_filename || "Manual Entry"} 
    [Tags: {context.topic_tags}] ---
{context.content_text}
--- END SOURCE ---

GROUNDING RULES:
1. Every substantive claim must cite which source document it comes from.
2. If you cannot find a position in the provided context, say: "I don't 
   have specific information on that topic from {candidate.name}'s 
   materials. I'd recommend reaching out to their office directly at 
   {candidate.contact_info}."
3. Never fabricate, infer, or extrapolate positions beyond what is 
   explicitly stated in the context.
4. If the user asks about a topic partially covered, share what you 
   know and clearly note the limits of the available information.
```

### 4.3 Alignment Score Pipeline

**Trigger:** Runs automatically whenever `candidate_contexts` is modified (create, update, delete).

**Process:**

```
1. GATHER PUBLIC RECORD
   ├── Web search: "{candidate.name} {candidate.office} statements"
   ├── Web search: "{candidate.name} {candidate.office} voting record"
   ├── Web search: "{candidate.name} {candidate.office} interview"
   └── Collect top results (limit: 10 sources)

2. GATHER CANDIDATE CONTEXT
   └── Concatenate all active candidate_contexts entries

3. COMPARE VIA CLAUDE (Opus)
   ├── System prompt: "You are an alignment analysis tool..."
   ├── Input: Public record + uploaded context
   └── Output: { score: 0-100, rationale: "...", discrepancies: [...] }

4. STORE RESULT
   ├── Update candidates.alignment_score
   ├── Update candidates.alignment_rationale
   └── Create audit_log entry (action: alignment_score_computed)
```

**Claude Comparison Prompt:**

```
Analyze the alignment between a political candidate's publicly available 
statements and their uploaded platform context.

PUBLIC STATEMENTS AND RECORD:
{public_record_text}

CANDIDATE'S UPLOADED CONTEXT:
{context_text}

Evaluate on these dimensions:
1. Policy positions: Do uploaded positions match public statements?
2. Tone and emphasis: Are priorities presented consistently?
3. Omissions: Are significant public positions missing from context?
4. Contradictions: Are there direct conflicts between public record 
   and uploaded context?

Respond in JSON:
{
  "score": <0-100 integer>,
  "rationale": "<2-3 sentence explanation>",
  "discrepancies": [
    {"topic": "...", "public_position": "...", "uploaded_position": "...", "severity": "low|medium|high"}
  ]
}
```

### 4.4 Conversation Summary Generation

**Trigger:** When constituent ends a conversation or after 30 minutes of inactivity.

**Prompt to Claude (Sonnet):**

```
Summarize this conversation between a constituent and the AI 
representative of {candidate.name}. Focus on:
1. Key policy positions discussed
2. Specific questions the constituent asked
3. Any topics where the AI could not provide information

Conversation transcript:
{messages_json}

Respond with a concise summary (3-5 sentences) that the constituent 
can save for reference.
```

### 4.5 Topic Extraction for Analytics

**Trigger:** Runs on each conversation when it ends.

**Prompt to Claude (Sonnet):**

```
Extract the main topics discussed in this conversation. Categorize 
each into one or more of these standard tags: economy, education, 
healthcare, housing, environment, public-safety, infrastructure, 
taxes, immigration, civil-rights, local-business, transportation, 
other.

Also extract the top 3 specific questions the constituent asked, 
rephrased as clean, representative questions.

Conversation transcript:
{messages_json}

Respond in JSON:
{
  "topics": ["economy", "housing"],
  "questions": [
    "What is your plan for affordable housing?",
    "How will you support small businesses?",
    "Where do you stand on property tax reform?"
  ]
}
```

---

## 5. File Processing Pipeline

### 5.1 Supported Upload Formats

| Format | Library | Extraction Method |
|---|---|---|
| PDF (.pdf) | pdf-parse | Full text extraction with page boundaries |
| Word (.docx) | mammoth.js | Convert to plain text, preserve structure |
| Plain text (.txt) | Native | Direct read |

### 5.2 Processing Flow

```
Upload received
    │
    ├── Validate file type and size (max 10MB)
    │
    ├── Extract text content
    │   ├── PDF → pdf-parse → raw text
    │   ├── DOCX → mammoth.js → plain text
    │   └── TXT → direct read
    │
    ├── Compute SHA-256 hash of extracted text
    │
    ├── Store original file to filesystem
    │   └── /uploads/{candidate_id}/{uuid}.{ext}
    │
    ├── Create candidate_contexts record
    │
    ├── Create audit_log entry (action: context_added)
    │
    └── Trigger alignment score recomputation (async)
```

### 5.3 File Storage Structure

```
/uploads/
  └── {candidate_id}/
      ├── {uuid}.pdf
      ├── {uuid}.docx
      └── {uuid}.txt
```

MVP uses local filesystem. Abstract through a storage service interface for future S3 migration:

```javascript
// storage.js — interface for MVP (local) and production (S3)
const StorageService = {
  save(candidateId, fileBuffer, filename) { ... },
  get(candidateId, fileId) { ... },
  delete(candidateId, fileId) { ... }
};
```

---

## 6. Frontend Architecture

### 6.1 Route Structure

```
/                           → Landing page with ZIP code search
/candidates?zip=xxxxx       → Candidate list for ZIP code
/candidates?zip=xxxxx&topics=a,b  → Filtered by topics
/candidate/:id              → Candidate public profile
/candidate/:id/chat         → AI conversation interface
/candidate/:id/audit        → Public audit timeline

/auth/login                 → Login (constituent or candidate)
/auth/register              → Registration (constituent or candidate)

/admin/dashboard            → Candidate admin home
/admin/context              → Upload/manage context documents
/admin/persona              → Configure AI persona
/admin/blocked-topics       → Manage blocked topics + kill switch
/admin/analytics            → View question analytics + engagement
/admin/audit                → View own audit trail
/admin/settings             → Profile, donation URL, account settings

/platform-admin/candidates  → Platform admin: manage verifications
```

### 6.2 Key Components

| Component | Description | Data Source |
|---|---|---|
| `ZipSearch` | Landing page ZIP code input with topic filter chips | Local state → API call |
| `CandidateCard` | Compact card with name, office, party, verification badge, alignment score | `GET /api/candidates` |
| `CandidateProfile` | Full profile with bio, topics, alignment score, audit timeline, donation CTA | `GET /api/candidates/:id/profile` |
| `ChatInterface` | Real-time message thread with AI persona | `POST /api/conversations/:id/messages` |
| `ChatMessage` | Single message bubble with source grounding indicators | Conversation state |
| `ConversationSummary` | End-of-chat summary card with key positions | `POST /api/conversations/:id/end` |
| `AuditTimeline` | Chronological list of context changes and kill switch events | `GET /api/candidates/:id/audit` |
| `TopicSelector` | Multi-select chip component for topic interests | Predefined topic list |
| `AlignmentBadge` | Circular percentage display with color coding (green/yellow/red) | Candidate data |
| `VerificationBadge` | Blue checkmark icon | Candidate data |
| `AdminContextManager` | Document upload + manual entry forms with topic tagging | `POST/GET /api/candidate/context` |
| `AdminPersonaEditor` | Tone selector, style textarea, key phrases | `PUT /api/candidate/persona` |
| `AdminKillSwitch` | Global pause toggle + per-topic toggles | `POST /api/candidate/kill-switch` |
| `AdminAnalytics` | Dashboard with charts for top questions, geographic breakdown, engagement | `GET /api/candidate/analytics` |
| `Disclaimer` | Persistent banner in chat: "This is an AI-generated representation..." | Static |

### 6.3 State Management

MVP uses React Context + `useReducer` for global state. No external state management library needed.

```
AppContext
├── auth: { user, token, role }
├── conversation: { id, messages[], candidateId, isLoading }
└── discovery: { zip, topics[], candidates[] }
```

---

## 7. Security & Authorization

### 7.1 Authentication Flow

```
Candidate Registration:
  email + password → bcrypt hash → store → return JWT

Candidate Login:
  email + password → verify bcrypt → return JWT

Constituent Registration:
  email + zip_code → store → return JWT

Constituent Login:
  email → verify → return JWT

Anonymous:
  No auth header → can browse candidates + chat
  Conversations flagged is_anonymous = true
```

### 7.2 Authorization Matrix

| Resource | Anonymous | Constituent | Candidate (own) | Admin |
|---|---|---|---|---|
| Browse candidates | ✅ | ✅ | ✅ | ✅ |
| View candidate profile | ✅ | ✅ | ✅ | ✅ |
| View public audit | ✅ | ✅ | ✅ | ✅ |
| Start conversation | ✅ (anon) | ✅ (tracked) | ❌ | ❌ |
| View own conversations | ❌ | ✅ | ❌ | ❌ |
| Manage context | ❌ | ❌ | ✅ | ❌ |
| Manage persona | ❌ | ❌ | ✅ | ❌ |
| Manage blocked topics | ❌ | ❌ | ✅ | ❌ |
| Activate kill switch | ❌ | ❌ | ✅ | ✅ |
| View analytics | ❌ | ❌ | ✅ (own) | ✅ (all) |
| Set verification | ❌ | ❌ | ❌ | ✅ |

### 7.3 Rate Limiting

| Endpoint | Anonymous | Authenticated |
|---|---|---|
| Chat messages | 20/hour per IP | 60/hour per user |
| Candidate search | 30/hour per IP | 100/hour per user |
| Context uploads | N/A | 20/day per candidate |
| Alignment recompute | N/A | Triggered on save (max 10/day) |

### 7.4 Input Validation

- All user text inputs sanitized for XSS.
- File uploads validated by MIME type and file extension (PDF, DOCX, TXT only).
- Maximum file size: 10MB per upload.
- Maximum total context per candidate: 50MB (MVP).
- ZIP codes validated against 5-digit US format.
- Email addresses validated by format.
- JWT tokens expire after 24 hours (candidate) / 7 days (constituent).

---

## 8. Audit Trail Implementation

### 8.1 Design Principles

The audit system is designed as an append-only, hash-chained log that can be migrated to blockchain anchoring in a future phase.

- **Append-only:** The application layer must never execute UPDATE or DELETE on `audit_logs`. Enforce via database trigger or application middleware.
- **Hash chain:** Each entry stores the SHA-256 hash of the previous entry for the same candidate, creating a per-candidate verification chain.
- **Content hashing:** Every context change includes a SHA-256 hash of the new content state, enabling tamper detection.

### 8.2 Hash Chain Construction

```
Entry N:
  content_hash = SHA-256(content_text)
  previous_hash = audit_logs[N-1].content_hash (for same candidate_id)

Verification:
  For each entry, confirm:
    1. content_hash matches SHA-256(stored content)
    2. previous_hash matches prior entry's content_hash
    3. No entries are missing (sequential integrity)
```

### 8.3 Public Audit View

Constituents see a read-only timeline:

```json
[
  {
    "action": "context_added",
    "timestamp": "2026-02-28T10:00:00Z",
    "summary": "Added document: Housing Policy White Paper"
  },
  {
    "action": "topic_blocked",
    "timestamp": "2026-02-28T11:30:00Z",
    "summary": "Blocked topic: Campaign Finance"
  },
  {
    "action": "kill_switch_activated",
    "timestamp": "2026-02-28T14:00:00Z",
    "summary": "AI conversations paused globally"
  }
]
```

Content details are **not** exposed publicly — only action type, timestamp, and a sanitized summary.

---

## 9. Predefined Topic Taxonomy

Standard topic tags used across the platform for candidate context tagging, constituent interest selection, and topic-based discovery matching.

| Tag | Display Name |
|---|---|
| `economy` | Economy & Jobs |
| `education` | Education |
| `healthcare` | Healthcare |
| `housing` | Housing |
| `environment` | Environment & Climate |
| `public-safety` | Public Safety & Policing |
| `infrastructure` | Infrastructure |
| `taxes` | Taxes & Budget |
| `immigration` | Immigration |
| `civil-rights` | Civil Rights & Equality |
| `local-business` | Local Business |
| `transportation` | Transportation |
| `technology` | Technology & Privacy |
| `veterans` | Veterans Affairs |
| `agriculture` | Agriculture |
| `foreign-policy` | Foreign Policy |
| `gun-policy` | Gun Policy |
| `social-services` | Social Services |

Both candidates and constituents can use custom tags beyond this list; the standard taxonomy enables cross-matching.

---

## 10. Error Handling

### 10.1 API Error Response Format

```json
{
  "error": {
    "code": "CONVERSATION_CANDIDATE_PAUSED",
    "message": "This candidate's AI representative is currently unavailable.",
    "details": {
      "candidate_id": "uuid",
      "paused_at": "2026-02-28T14:00:00Z"
    }
  }
}
```

### 10.2 Error Codes

| Code | HTTP Status | Description |
|---|---|---|
| `AUTH_INVALID_CREDENTIALS` | 401 | Email or password incorrect |
| `AUTH_TOKEN_EXPIRED` | 401 | JWT has expired |
| `AUTH_UNAUTHORIZED` | 403 | User does not have permission |
| `CANDIDATE_NOT_FOUND` | 404 | Candidate ID does not exist |
| `CANDIDATE_PAUSED` | 503 | Candidate's AI is globally paused |
| `CONVERSATION_NOT_FOUND` | 404 | Conversation ID does not exist |
| `CONTEXT_UPLOAD_FAILED` | 422 | File extraction failed |
| `CONTEXT_FILE_TOO_LARGE` | 413 | File exceeds 10MB limit |
| `CONTEXT_UNSUPPORTED_TYPE` | 415 | File type not PDF, DOCX, or TXT |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `AI_SERVICE_UNAVAILABLE` | 503 | Claude API unreachable |
| `ALIGNMENT_COMPUTE_FAILED` | 500 | Alignment score computation error |
| `BLOCKED_TOPIC_DETECTED` | 200 | Response contains redirect (not an error to user) |

### 10.3 AI Failure Fallbacks

| Failure | Fallback Behavior |
|---|---|
| Claude API timeout (>30s) | Return: "I'm experiencing a brief delay. Please try your question again in a moment." |
| Claude API 500 error | Retry once after 2s; if still failing, return service unavailable message |
| Alignment score computation fails | Keep previous score; create audit log entry noting failure; retry in 1 hour |
| Text extraction fails | Reject upload with descriptive error; suggest alternative format |

---

## 11. Performance Targets (MVP)

| Metric | Target |
|---|---|
| Candidate search response | < 200ms |
| Chat message response (first token) | < 2 seconds |
| Chat message response (complete) | < 10 seconds |
| File upload + extraction | < 15 seconds for 10MB PDF |
| Alignment score computation | < 60 seconds (async, non-blocking) |
| Concurrent chat sessions | 50+ simultaneous |
| Database query time | < 50ms for any indexed query |

---

## 12. Development Priorities (2-Hour Sprint)

### Build Order

| Order | Component | Est. Time | Dependencies |
|---|---|---|---|
| 1 | Database schema + seed data | 15 min | None |
| 2 | Auth endpoints (register/login) | 10 min | Database |
| 3 | Candidate admin: context upload + persona | 15 min | Auth |
| 4 | Candidate admin: blocked topics + kill switch | 10 min | Auth |
| 5 | AI system prompt builder + chat endpoint | 20 min | Context upload |
| 6 | Constituent: ZIP search + candidate list | 10 min | Database |
| 7 | Constituent: chat interface | 15 min | Chat endpoint |
| 8 | Alignment score pipeline | 10 min | Context upload |
| 9 | Analytics endpoint + dashboard | 10 min | Conversations |
| 10 | Audit trail + public view | 5 min | All mutations |

### Seed Data Requirements

For demo/testing, pre-populate the database with:

- 3–5 fictional candidates across local, state, and national levels
- Sample context documents per candidate (2–3 each)
- ZIP code mappings covering a sample district
- Sample blocked topics and persona configurations
- Pre-computed alignment scores

---

## 13. Future Technical Considerations

Items to architect for but not build in MVP:

- **RAG pipeline:** Vector search (e.g., pgvector) for candidates with context exceeding Claude's context window. Design the context storage to be chunk-friendly.
- **WebSocket streaming:** Stream Claude responses token-by-token for real-time chat feel. MVP can use polling or long-poll.
- **Queue system:** Background job processing for alignment scores (e.g., BullMQ, Celery). MVP uses synchronous background execution.
- **CDN / S3:** File storage migration. MVP filesystem abstraction layer enables drop-in replacement.
- **PostgreSQL migration:** Schema uses PostgreSQL-compatible types and constraints. Migration requires only connection string change + JSON column type updates.
- **Blockchain anchoring:** Audit trail hash chain is designed to publish periodic Merkle roots to a public chain. Schema includes `previous_hash` for chain verification.
- **Multi-tenancy / tiered access:** Database supports `election_level` field for future monetization tier enforcement.

---

*End of Document*
