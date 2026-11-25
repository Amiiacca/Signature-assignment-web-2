/*
 * server.js - Adoptions REST API (Node + Express + MongoDB)
 *
 * Routes
 *   GET /api/adoptions                    all adoptions, sorted by AdoptionDate
 *   GET /api/adoptions/:id                one adoption whose AdoptionID = :id
 *   GET /api/adoptions/university/:id     all adoptions whose UniversityID = :id
 *
 * The test page in /public is served from the same origin, but CORS headers are
 * also sent so the page still works when opened from another domain or port.
 */
const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.DB_NAME || 'project3';

const app = express();
let adoptions; // MongoDB collection, set once connected

// ---- CORS: let a test page on another domain call this API --------------------
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ---- Static test page -------------------------------------------------------
app.use(express.static(path.join(__dirname, 'public')));

// Hide MongoDB's internal _id from API responses
const projection = { _id: 0 };

// Route params must be whole numbers; returns the number or null
function toId(value) {
  return /^\d+$/.test(value) ? Number(value) : null;
}

// ---- Routes ---------------------------------------------------------------

// GET /api/adoptions -> every adoption, oldest first (?order=desc for newest first)
app.get('/api/adoptions', async (req, res, next) => {
  try {
    const direction = req.query.order === 'desc' ? -1 : 1;
    const docs = await adoptions
      .find({}, { projection })
      .sort({ AdoptionDate: direction, AdoptionID: 1 })
      .toArray();
    res.json(docs);
  } catch (err) { next(err); }
});

// GET /api/adoptions/university/:id -> adoptions for one university.
// Declared before /:id for readability; the paths never clash because
// "/university/100724" has two segments and "/:id" matches only one.
app.get('/api/adoptions/university/:id', async (req, res, next) => {
  try {
    const id = toId(req.params.id);
    if (id === null) return res.status(400).json({ error: 'UniversityID must be a whole number' });

    const docs = await adoptions
      .find({ UniversityID: id }, { projection })
      .sort({ AdoptionDate: 1 })
      .toArray();
    if (docs.length === 0) {
      return res.status(404).json({ error: `No adoptions found for UniversityID ${id}` });
    }
    res.json(docs);
  } catch (err) { next(err); }
});

// GET /api/adoptions/:id -> one adoption
app.get('/api/adoptions/:id', async (req, res, next) => {
  try {
    const id = toId(req.params.id);
    if (id === null) return res.status(400).json({ error: 'AdoptionID must be a whole number' });

    const doc = await adoptions.findOne({ AdoptionID: id }, { projection });
    if (!doc) return res.status(404).json({ error: `Adoption ${id} not found` });
    res.json(doc);
  } catch (err) { next(err); }
});

// Unknown /api paths -> JSON 404 instead of Express's HTML page
app.use('/api', (req, res) => res.status(404).json({ error: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// ---- Start -----------------------------------------------------------------
async function start() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  adoptions = client.db(DB_NAME).collection('adoptions');
  console.log(`Connected to MongoDB: ${DB_NAME}.adoptions`);

  app.listen(PORT, () => {
    console.log(`API running at http://localhost:${PORT}/api/adoptions`);
    console.log(`Test page at   http://localhost:${PORT}/`);
  });
}

start().catch(err => {
  console.error('Could not start server:', err.message);
  process.exit(1);
});
