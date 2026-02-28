const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const DB_PATH = process.env.DATABASE_PATH || './townhall.db';
const db = new Database(path.resolve(DB_PATH));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS candidates (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    office TEXT NOT NULL,
    election_level TEXT NOT NULL CHECK(election_level IN ('local', 'state', 'national')),
    district TEXT NOT NULL,
    zip_codes TEXT NOT NULL DEFAULT '[]',
    party TEXT,
    bio TEXT,
    persona_config TEXT DEFAULT '{}',
    donation_url TEXT,
    is_verified INTEGER DEFAULT 0,
    is_paused INTEGER DEFAULT 0,
    alignment_score REAL,
    alignment_rationale TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS candidate_contexts (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL REFERENCES candidates(id),
    content_type TEXT NOT NULL CHECK(content_type IN ('document', 'manual')),
    original_filename TEXT,
    content_text TEXT NOT NULL,
    topic_tags TEXT DEFAULT '[]',
    content_hash TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_contexts_candidate ON candidate_contexts(candidate_id, is_active);

  CREATE TABLE IF NOT EXISTS blocked_topics (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL REFERENCES candidates(id),
    topic TEXT NOT NULL,
    redirect_message TEXT,
    redirect_url TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_blocked_candidate ON blocked_topics(candidate_id, is_active);

  CREATE TABLE IF NOT EXISTS constituents (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    zip_code TEXT NOT NULL,
    interest_tags TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_constituents_zip ON constituents(zip_code);

  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL REFERENCES candidates(id),
    constituent_id TEXT REFERENCES constituents(id),
    is_anonymous INTEGER NOT NULL DEFAULT 1,
    messages TEXT NOT NULL DEFAULT '[]',
    summary TEXT,
    topic_tags TEXT DEFAULT '[]',
    message_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    ended_at TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_conversations_candidate ON conversations(candidate_id, created_at);

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    candidate_id TEXT NOT NULL REFERENCES candidates(id),
    action_type TEXT NOT NULL,
    content_hash TEXT,
    previous_hash TEXT,
    details TEXT DEFAULT '{}',
    actor_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_audit_candidate ON audit_logs(candidate_id, created_at, action_type);
`);

console.log('Database schema initialized.');
module.exports = db;
