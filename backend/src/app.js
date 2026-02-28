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

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Auto-seed on cold start in production — schema.js must be fully loaded first
if (process.env.NODE_ENV === 'production') {
  const db = require('./db/schema');
  const isEmpty = db.prepare('SELECT COUNT(*) as count FROM candidates').get().count === 0;
  if (isEmpty) {
    console.log('Cold start: DB empty, seeding demo data...');
    const seedBase = require('./db/seed');
    const seedDemo = require('./db/seed_demo');
    seedBase()
      .then(() => seedDemo())
      .then(() => console.log('Demo seed complete.'))
      .catch(e => console.error('Seed error:', e));
  }
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' }
  });
});

module.exports = app;
