import { MongoClient } from 'mongodb';
import fetch from 'node-fetch';

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
  const { id } = req.query; // Get the fighter ID from the URL
  console.log(`Fetching fighter by ID: ${id}`);

  if (req.method === 'GET') {
    try {
      const response = await fetch(
        `https://api.sportsdata.io/v3/mma/scores/json/Fighter/${id}?key=${process.env.VITE_API_KEY}`
      );
      if (!response.ok) {
        const responseBody = await response.text();  // Log the response body for more details
        console.error('Error fetching fighter:', response.statusText, responseBody);
        throw new Error(`Failed to fetch fighter: ${response.statusText}`);
      }
      
      const fighter = await response.json();
      res.status(200).json(fighter);
    } catch (error) {
      console.error('Error fetching fighter data:', error.message);
      res.status(500).send('Failed to fetch fighter data');
    }
  } else {
    res.status(404).send('Route not found');
  }
}
