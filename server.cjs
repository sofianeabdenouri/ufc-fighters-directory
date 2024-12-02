require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// CORS Configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

app.use(bodyParser.json());

// MongoDB Connection
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_NAME;
let favoritesCollection;

async function connectToDB() {
  try {
    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    favoritesCollection = db.collection('favorites'); // Adjust collection name
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit if the DB connection fails
  }
}

// Route to fetch fighters from the SportsData API
app.get('/fighters', async (req, res) => {
  try {
    const fetch = (await import('node-fetch')).default;
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

// Route to fetch a specific fighter by ID
app.get('/fighters/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const fetch = (await import('node-fetch')).default;
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

// Example favorites-related route
app.get('/favorites/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const userFavorites = await favoritesCollection.findOne({ userId });
    res.json(userFavorites ? userFavorites.fighterIds : []);
  } catch (error) {
    console.error('Error fetching favorites:', error.message);
    res.status(500).send('Server error');
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Welcome to the UFC Fighters Directory API!');
});

// Start the server after connecting to the database
connectToDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});
