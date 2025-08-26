import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";

const app = express();

// Allowed origins for CORS
const allowedOrigins = [
  "http://localhost:5173", // Local frontend
  "https://mmarec.vercel.app", // Production frontend
];

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
};
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

// MongoDB connection setup
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_NAME;

let cachedDb = null;

async function connectToDB() {
  if (cachedDb) return cachedDb;
  console.log("Connecting to MongoDB...");
  const client = new MongoClient(uri);
  await client.connect();
  cachedDb = client.db(dbName);
  console.log("Connected to MongoDB");
  return cachedDb;
}

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// API route to fetch fighters
app.get("/api/fighters", async (_req, res) => {
  try {
    console.log("Fetching fighters...");
    const response = await fetch(
      `https://api.sportsdata.io/v3/mma/scores/json/FightersBasic?key=${process.env.VITE_API_KEY}`
    );
    if (!response.ok) throw new Error(`SportsData: ${response.statusText}`);
    const fighters = await response.json();
    res.json(fighters);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch fighters", details: err.message });
  }
});

// API route to fetch fighter by ID
app.get("/api/fighters/:id", async (req, res) => {
  try {
    console.log(`Fetching fighter ${req.params.id}`);
    const response = await fetch(
      `https://api.sportsdata.io/v3/mma/scores/json/Fighter/${req.params.id}?key=${process.env.VITE_API_KEY}`
    );
    if (!response.ok) throw new Error(`SportsData: ${response.statusText}`);
    const fighter = await response.json();
    res.json(fighter);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch fighter", details: err.message });
  }
});

// Default route
app.get("/", (_req, res) => {
  res.send("Welcome to MMA Fighters Directory API!");
});

// Local dev only
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 5000;
  app.listen(port, async () => {
    console.log(`Server running at http://localhost:${port}`);
    try {
      await connectToDB();
    } catch (err) {
      console.error("DB connection failed", err.message);
    }
  });
}

// ✅ Vercel will just import this Express app
export default app;
