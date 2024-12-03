import { MongoClient } from 'mongodb';
import fetch from 'node-fetch';
import cors from 'cors';

let db, favoritesCollection;

// MongoDB Connection
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_NAME;

async function connectToDB() {
  if (!db) {
    try {
      const client = new MongoClient(uri);
      await client.connect();
      console.log('Connected to MongoDB');
      db = client.db(dbName);
      favoritesCollection = db.collection('favorites'); // Adjust collection name
    } catch (error) {
      console.error('Error connecting to MongoDB:', error.message);
      throw error;
    }
  }
}

// CORS middleware configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*', // Replace '*' with your frontend URL in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};

// Main handler
export default async function handler(req, res) {
  // Apply CORS
  const corsMiddleware = cors(corsOptions);
  await new Promise((resolve, reject) => {
    corsMiddleware(req, res, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  // Connect to the database
  await connectToDB();

  const { method, url } = req;

  // Root Route
  if (url === '/' && method === 'GET') {
    return res.status(200).send('Welcome to the UFC Fighters Directory API!');
  }

  // Fetch Fighters Route
  if (url === '/fighters' && method === 'GET') {
    try {
      const response = await fetch(
        `https://api.sportsdata.io/v3/mma/scores/json/FightersBasic?key=${process.env.VITE_API_KEY}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch fighters: ${response.statusText}`);
      }
      const fighters = await response.json();
      return res.status(200).json(fighters);
    } catch (error) {
      console.error('Error fetching fighters:', error.message);
      return res.status(500).send('Failed to fetch fighters');
    }
  }

  // Fetch Fighter by ID Route
  if (url.startsWith('/fighters/') && method === 'GET') {
    const id = url.split('/')[2];
    try {
      const response = await fetch(
        `https://api.sportsdata.io/v3/mma/scores/json/Fighter/${id}?key=${process.env.VITE_API_KEY}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch fighter: ${response.statusText}`);
      }
      const fighter = await response.json();
      return res.status(200).json(fighter);
    } catch (error) {
      console.error('Error fetching fighter:', error.message);
      return res.status(500).send('Failed to fetch fighter data');
    }
  }

  // Favorites Route (example usage)
  if (url.startsWith('/favorites/') && method === 'GET') {
    const userId = url.split('/')[2];
    try {
      const userFavorites = await favoritesCollection.findOne({ userId });
      return res
        .status(200)
        .json(userFavorites ? userFavorites.fighterIds : []);
    } catch (error) {
      console.error('Error fetching favorites:', error.message);
      return res.status(500).send('Failed to fetch favorites');
    }
  }

  // Catch-all for unmatched routes
  res.status(404).send('Route not found');
}
