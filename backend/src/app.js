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
const candidateCount = db.prepare('SELECT COUNT(*) as count FROM candidates').get().count;
console.log(`[startup] candidates in DB: ${candidateCount}`);
if (candidateCount === 0) {
  console.log('[startup] DB empty — seeding now...');
  try {
    seedBase();
    seedDemo();
    console.log('[startup] Seed complete.');
  } catch (e) {
    console.error('[startup] Seed failed:', e);
  }
} else {
  console.log('[startup] DB already has data, skipping seed.');
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
