import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env

const app = express();
const port = process.env.PORT || 5000; // Use PORT from environment if available

app.use(cors());
app.use(bodyParser.json());

// MongoDB URI and Client
const uri = process.env.MONGODB_URI; // Get MongoDB URI from environment
const client = new MongoClient(uri);

let db;
let favoritesCollection;

// Connect to MongoDB
async function connectToDB() {
    try {
        await client.connect();
        db = client.db('Cluster0'); // Use your database name here
        favoritesCollection = db.collection('favorites'); // Use the 'favorites' collection
        console.log('Connected to MongoDB!');
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
}

connectToDB();

// API Endpoints
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

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
