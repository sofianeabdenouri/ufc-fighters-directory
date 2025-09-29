// api/server.js
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
// On Node 20/22, global fetch exists. If you prefer node-fetch, keep your import.
// import fetch from 'node-fetch';

const app = express();

// ---------- CORS (allow localhost + any *.vercel.app) ----------
const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // same-origin / curl
    if (origin === 'http://localhost:5173') return cb(null, true);
    if (origin.endsWith('.vercel.app')) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  optionsSuccessStatus: 200,
};
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
app.use(express.json());

// ---------- Mongo (only if you need it on some routes) ----------
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_NAME;
let cachedDb = null;

async function connectToDB() {
  if (cachedDb) return cachedDb;
  const client = new MongoClient(uri);
  await client.connect();
  cachedDb = client.db(dbName);
  return cachedDb;
}

// ---------- Small helper: fetch with timeout ----------
async function fetchWithTimeout(url, ms = 12000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(t);
  }
}

// ---------- Logging ----------
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ---------- Routes ----------
app.get('/api/fighters', async (_req, res) => {
  try {
    const url = `https://api.sportsdata.io/v3/mma/scores/json/FightersBasic?key=${process.env.VITE_API_KEY}`;
    const response = await fetchWithTimeout(url);
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`SportsData: ${response.status} ${response.statusText} ${body}`);
    }
    const fighters = await response.json();
    res.status(200).json(fighters);
  } catch (err) {
    console.error('GET /api/fighters', err.message);
    res.status(500).json({ error: 'Failed to fetch fighters' });
  }
});

app.get('/api/fighters/:id', async (req, res) => {
  try {
    const url = `https://api.sportsdata.io/v3/mma/scores/json/Fighter/${req.params.id}?key=${process.env.VITE_API_KEY}`;
    const response = await fetchWithTimeout(url);
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`SportsData: ${response.status} ${response.statusText} ${body}`);
    }
    const fighter = await response.json();
    res.status(200).json(fighter);
  } catch (err) {
    console.error(`GET /api/fighters/${req.params.id}`, err.message);
    res.status(500).json({ error: `Failed to fetch fighter ${req.params.id}` });
  }
});

// Root
app.get('/', (_req, res) => {
  res.status(200).send('Welcome to MMA Fighters Directory API!');
});

// ---------- Local dev server ----------
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 5001;
  app.listen(port, async () => {
    console.log(`Server running on http://localhost:${port}`);
    // Only connect locally to verify credentials if you actually need DB
    try { await connectToDB(); console.log('Mongo connected (local)'); } catch {}
  });
}

// ---------- Vercel serverless handler ----------
export default async (req, res) => {
  try {
    // IMPORTANT: do NOT connect to Mongo here unless a route needs it.
    // If later you add a DB-backed route, call `await connectToDB()` inside that route.
    app(req, res);
  } catch (err) {
    console.error('Handler error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
