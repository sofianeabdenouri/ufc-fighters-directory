const { MongoClient } = require('mongodb');

const uri = MONGODB_URI;
const dbName = MONGODB_NAME;
let client;

async function connectToDB() {
    if (!client) {
        client = new MongoClient(uri);
        await client.connect();
        console.log("Connected to MongoDB!");
    }
    return client.db(dbName); // Replace with your DB name
}

async function disconnectFromDB() {
    if (client) {
        await client.close();
        console.log("Disconnected from MongoDB!");
        client = null; // Ensure it’s reset
    }
}

module.exports = { connectToDB, disconnectFromDB };
