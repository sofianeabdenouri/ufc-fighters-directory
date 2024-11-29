require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_NAME;

const client = new MongoClient(uri, {
  tls: true, // Ensure secure connection to MongoDB
});

let db;
let favoritesCollection;

async function connectToDB() {
  try {
    await client.connect();
    db = client.db(dbName);
    favoritesCollection = db.collection('favorites');
    console.log('Connected to MongoDB!');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1); // Exit process on failure
  }
}

connectToDB();

app.get('/favorites/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const userFavorites = await favoritesCollection.findOne({ userId });
    res.json(userFavorites ? userFavorites.fighterIds : []);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).send('Server error');
  }
});

app.post('/favorites/:userId', async (req, res) => {
  const { userId } = req.params;
  const { fighterId } = req.body;

  try {
    await favoritesCollection.updateOne(
      { userId },
      { $addToSet: { fighterIds: fighterId } },
      { upsert: true }
    );
    res.send('Added to favorites');
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).send('Server error');
  }
});

app.delete('/favorites/:userId', async (req, res) => {
  const { userId } = req.params;
  const { fighterId } = req.body;

  try {
    await favoritesCollection.updateOne(
      { userId },
      { $pull: { fighterIds: fighterId } }
    );
    res.send('Removed from favorites');
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).send('Server error');
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to the UFC Fighters Directory API!');
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
