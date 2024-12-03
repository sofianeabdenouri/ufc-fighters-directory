import { MongoClient } from 'mongodb';
import fetch from 'node-fetch';

// CORS configuration
function addCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

let db, favoritesCollection;

// Connect to MongoDB
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

// Main handler function
export default async function handler(req, res) {
  // Add CORS headers for every request
  addCorsHeaders(res);

  // Handle preflight (OPTIONS) requests
  if (req.method === 'OPTIONS') {
    return res.status(204).end(); // Respond with no content for preflight
  }

  // Connect to MongoDB once
  await connectToDB();

  // Parse the path and method
  const { method, url } = req;

  // Root endpoint
  if (url === '/' && method === 'GET') {
    return res.status(200).send('Welcome to the UFC Fighters Directory API!');
  }

  // Route to fetch all fighters
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

  // Route to fetch a specific fighter by ID
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

  // Favorites route
  if (url.startsWith('/favorites/') && method === 'GET') {
    const userId = url.split('/')[2];
    try {
      const userFavorites = await favoritesCollection.findOne({ userId });
      return res
        .status(200)
        .json(userFavorites ? userFavorites.fighterIds : []);
    } catch (error) {
      console.error('Error fetching favorites:', error.message);
      return res.status(500).send('Server error');
    }
  }

  // If no routes match
  res.status(404).send('Route not found');
}
