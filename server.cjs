require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // For making API requests

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Route to fetch fighters from the SportsData API
app.get('/fighters', async (req, res) => {
  try {
    // Fetch fighters using the SportsData API
    const response = await fetch(`https://api.sportsdata.io/v3/mma/scores/json/FightersBasic?key=${process.env.VITE_API_KEY}`);

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

// Example favorites-related route (MongoDB)
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

// Root endpoint
app.get('/', (req, res) => {
  res.send('Welcome to the UFC Fighters Directory API!');
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
