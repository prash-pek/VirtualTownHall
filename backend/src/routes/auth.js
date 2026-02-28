const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const db = require('../db/schema');

const router = express.Router();

// POST /api/auth/candidate/register
router.post('/candidate/register', async (req, res) => {
  const { email, password, name, office, election_level, district, zip_codes, party, bio } = req.body;
  if (!email || !password || !name || !office || !election_level || !district) {
    return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Missing required fields.' } });
  }

  const existing = db.prepare('SELECT id FROM candidates WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: { code: 'EMAIL_TAKEN', message: 'Email already registered.' } });

  const password_hash = await bcrypt.hash(password, 10);
  const id = randomUUID();

  db.prepare(`
    INSERT INTO candidates (id, email, password_hash, name, office, election_level, district, zip_codes, party, bio)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, email, password_hash, name, office, election_level, district, JSON.stringify(zip_codes || []), party || null, bio || null);

  const token = jwt.sign({ id, email, role: 'candidate', candidateId: id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN_CANDIDATE || '24h' });
  res.status(201).json({ token, candidateId: id });
});

// POST /api/auth/candidate/login
router.post('/candidate/login', async (req, res) => {
  const { email, password } = req.body;
  const candidate = db.prepare('SELECT * FROM candidates WHERE email = ?').get(email);
  if (!candidate) return res.status(401).json({ error: { code: 'AUTH_INVALID_CREDENTIALS', message: 'Invalid email or password.' } });

  const valid = await bcrypt.compare(password, candidate.password_hash);
  if (!valid) return res.status(401).json({ error: { code: 'AUTH_INVALID_CREDENTIALS', message: 'Invalid email or password.' } });

  const token = jwt.sign({ id: candidate.id, email, role: 'candidate', candidateId: candidate.id }, process.env.JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, candidateId: candidate.id });
});

// POST /api/auth/constituent/register
router.post('/constituent/register', async (req, res) => {
  const { email, zip_code, interest_tags } = req.body;
  if (!email || !zip_code) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Email and ZIP code required.' } });

  const existing = db.prepare('SELECT id FROM constituents WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: { code: 'EMAIL_TAKEN', message: 'Email already registered.' } });

  const id = randomUUID();
  db.prepare('INSERT INTO constituents (id, email, zip_code, interest_tags) VALUES (?, ?, ?, ?)').run(id, email, zip_code, JSON.stringify(interest_tags || []));

  const token = jwt.sign({ id, email, role: 'constituent', zipCode: zip_code }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, constituentId: id });
});

// POST /api/auth/constituent/login
router.post('/constituent/login', async (req, res) => {
  const { email } = req.body;
  const constituent = db.prepare('SELECT * FROM constituents WHERE email = ?').get(email);
  if (!constituent) return res.status(401).json({ error: { code: 'AUTH_INVALID_CREDENTIALS', message: 'Email not found.' } });

  const token = jwt.sign({ id: constituent.id, email, role: 'constituent', zipCode: constituent.zip_code }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, constituentId: constituent.id });
});

module.exports = router;
