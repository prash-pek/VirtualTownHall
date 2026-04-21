require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const candidateRoutes = require('./routes/candidate');
const constituentRoutes = require('./routes/constituent');
const constituentProfileRoutes = require('./routes/constituentProfile');
const conversationRoutes = require('./routes/conversations');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/candidate', candidateRoutes);
app.use('/api/candidates', constituentRoutes);
app.use('/api/constituent', constituentProfileRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/admin', adminRoutes);

// Seed on every cold start — INSERT OR IGNORE means duplicates are safe
const db = require('./db/schema');
const seedBase = require('./db/seed');
const seedDemo = require('./db/seed_demo');
const seedKnopeAnalytics = require('./db/seed_knope_analytics');
const seedNational = require('./db/seed_national');

// On empty DB or when RESEED=1 is set in env, seed demo data.
// Only rows marked is_seed=1 are ever deleted — real user accounts are never touched.
// To refresh demo data: set RESEED=1 in Railway env vars, deploy, then remove it.
const candidateCount = db.prepare('SELECT COUNT(*) as count FROM candidates').get().count;
const forceReseed = process.env.RESEED === '1';

if (candidateCount === 0 || forceReseed) {
  console.log(`[startup] Seeding demo data (forceReseed=${forceReseed})...`);
  try {
    if (forceReseed) {
      db.exec(`
        DELETE FROM conversations      WHERE candidate_id IN (SELECT id FROM candidates WHERE is_seed = 1);
        DELETE FROM candidate_contexts WHERE candidate_id IN (SELECT id FROM candidates WHERE is_seed = 1);
        DELETE FROM blocked_topics     WHERE candidate_id IN (SELECT id FROM candidates WHERE is_seed = 1);
        DELETE FROM audit_logs         WHERE candidate_id IN (SELECT id FROM candidates WHERE is_seed = 1);
        DELETE FROM constituents       WHERE email LIKE '%@knope-analytics.test';
        DELETE FROM candidates         WHERE is_seed = 1;
      `);
    }
    seedBase();
    seedDemo();
    seedKnopeAnalytics();
    seedNational();
    console.log('[startup] Seed complete.');
  } catch (e) {
    console.error('[startup] Seed failed:', e);
  }
} else {
  console.log('[startup] DB has data, skipping seed.');
}

app.get('/api/health', (req, res) => {
  const count = db.prepare('SELECT COUNT(*) as count FROM candidates').get().count;
  res.json({ status: 'ok', candidates: count });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' }
  });
});

module.exports = app;
