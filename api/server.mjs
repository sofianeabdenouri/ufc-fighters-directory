import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

import express from 'express';
import { MongoClient } from 'mongodb';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const allowedOrigins = [
  'http://localhost:5173',       // Your local frontend for development
  'https://ufcrec.vercel.app',  // Your deployed frontend
];

const corsOptions = {
  origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
          callback(null, true);
      } else {
          callback(new Error('Not allowed by CORS'));
      }
  },
  optionsSuccessStatus: 200, // For older browsers
};
app.options('*', cors(corsOptions)); // Allow preflight requests

app.use(cors(corsOptions));
// Use environment variables from .env file
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_NAME;
let favoritesCollection;

// MongoDB connection setup
async function connectToDB() {
  console.log('MongoDB URI:', uri); // Log MongoDB URI
  console.log('MongoDB DB Name:', dbName); // Log DB name

  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    favoritesCollection = db.collection('favorites');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit if DB connection fails
  }
}

// API route to fetch fighters from SportsData API
app.get('/fighters', async (req, res) => {
  try {
    const response = await fetch(
      `https://api.sportsdata.io/v3/mma/scores/json/FightersBasic?key=${process.env.VITE_API_KEY}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch fighters: ${response.statusText}`);
    }
    const fighters = await response.json();
    res.json(fighters);
  } catch (error) {
    console.error('Error fetching fighters:', error.message);
    res.status(500).send('Failed to fetch fighters');
  }
});

// API route to fetch a specific fighter by ID
app.get('/fighters/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await fetch(
      `https://api.sportsdata.io/v3/mma/scores/json/Fighter/${id}?key=${process.env.VITE_API_KEY}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch fighter: ${response.statusText}`);
    }
    const fighter = await response.json();
    res.json(fighter);
  } catch (error) {
    console.error('Error fetching fighter:', error.message);
    res.status(500).send('Failed to fetch fighter data');
  }
});

// Default route
app.get('/', (req, res) => {
  res.status(200).send('Welcome to the UFC Fighters Directory API!');
});

// Check if we are running locally or on Vercel
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 5001;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    connectToDB(); // Ensure the DB connection is established
  });
}

// Export handler for Vercel
export default (req, res) => app(req, res);
