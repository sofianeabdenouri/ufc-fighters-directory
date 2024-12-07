import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

import express from 'express';
import { MongoClient } from 'mongodb';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();

// Allowed origins for CORS
const allowedOrigins = [
    'http://localhost:5173', // Local frontend
    'https://ufcrec.vercel.app', // Deployed frontend
];

// CORS configuration
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200,
};

app.options('*', cors(corsOptions)); // Preflight requests
app.use(cors(corsOptions)); // Enable CORS

// MongoDB connection variables
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_NAME;

let cachedDb = null; // Cache the database connection

async function connectToDB() {
    if (cachedDb) {
        console.log('Using cached database instance');
        return cachedDb;
    }

    console.log('Connecting to MongoDB...');
    try {
        const client = new MongoClient(uri);

        await client.connect();
        console.log('Connected to MongoDB');
        cachedDb = client.db(dbName); // Cache the database instance
        return cachedDb;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        throw error; // Throw error to avoid silent failure
    }
}

// Log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// API route to fetch fighters from SportsData API
app.get('/api/fighters', async (req, res) => {
    try {
        console.log('Fetching fighters...');
        const response = await fetch(
            `https://api.sportsdata.io/v3/mma/scores/json/FightersBasic?key=${process.env.VITE_API_KEY}`
        );
        if (!response.ok) {
            throw new Error(`Failed to fetch fighters: ${response.statusText}`);
        }
        const fighters = await response.json();
        res.status(200).json(fighters);
    } catch (error) {
        console.error('Error fetching fighters:', error.message);
        res.status(500).json({ error: 'Failed to fetch fighters', details: error.message });
    }
});

// API route to fetch a specific fighter by ID
app.get('/api/fighters/:id', async (req, res) => {
    const { id } = req.params;
    try {
        console.log(`Fetching fighter with ID: ${id}`);
        const response = await fetch(
            `https://api.sportsdata.io/v3/mma/scores/json/Fighter/${id}?key=${process.env.VITE_API_KEY}`
        );
        if (!response.ok) {
            throw new Error(`Failed to fetch fighter: ${response.statusText}`);
        }
        const fighter = await response.json();
        res.status(200).json(fighter);
    } catch (error) {
        console.error(`Error fetching fighter with ID ${id}:`, error.message);
        res.status(500).json({ error: `Failed to fetch fighter with ID ${id}`, details: error.message });
    }
});

// Default route
app.get('/', (req, res) => {
    res.status(200).send('Welcome to the UFC Fighters Directory API!');
});

// Local server setup
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 5001;
    app.listen(port, async () => {
        console.log(`Server running on http://localhost:${port}`);
        await connectToDB(); // Ensure DB connection is tested on startup
    });
}

// Export handler for Vercel
export default async (req, res) => {
    try {
        const db = await connectToDB(); // Ensure DB connection for serverless deployment
        req.db = db; // Attach the database instance to the request
        app(req, res);
    } catch (error) {
        console.error('Error during serverless MongoDB connection:', error.message);
        return res.status(500).json({ error: 'Failed to connect to the database', details: error.message });
    }
};
