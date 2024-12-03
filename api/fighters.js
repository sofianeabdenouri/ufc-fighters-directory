import { MongoClient } from 'mongodb';
import fetch from 'node-fetch'; // Dynamically import fetch for serverless environments

let db, favoritesCollection;

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_NAME;

async function connectToDB() {
  if (!db) {
    try {
      console.log('Connecting to MongoDB...');
      const client = new MongoClient(uri);
      await client.connect();
      console.log('Connected to MongoDB');
      db = client.db(dbName);
      favoritesCollection = db.collection('favorites');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error.message);
      throw error;
    }
  } else {
    console.log('MongoDB connection already established');
  }
}

export default async function handler(req, res) {
  // Check request method
  if (req.method === 'GET') {
    // Handle fetching fighters
    console.log('Fetching fighters...');
    try {
      const response = await fetch(
        `https://api.sportsdata.io/v3/mma/scores/json/FightersBasic?key=${process.env.VITE_API_KEY}`
      );

      if (!response.ok) {
        const responseBody = await response.text();  // Log the response body for more details
        console.error('Error fetching fighters:', response.statusText, responseBody);
        throw new Error(`Failed to fetch fighters: ${response.statusText}`);
      }
      
      const fighters = await response.json();
      res.status(200).json(fighters);
    } catch (error) {
      console.error('Error fetching fighters:', error.message);
      res.status(500).send('Failed to fetch fighters');
    }
  } else {
    res.status(404).send('Route not found');
  }
}
