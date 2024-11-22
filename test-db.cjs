const { connectToDB, disconnectFromDB } = require('./db.cjs');

async function testDB() {
    try {
        const db = await connectToDB(); // Connect to the DB
        console.log("Testing DB connection...");

        const collection = db.collection('favorites'); // Replace with your collection name
        console.log("Fetching all data from 'favorites' collection...");

        const data = await collection.find({}).toArray();
        console.log("Data in favorites collection:", data);

    } catch (error) {
        console.error("Error during DB test:", error);
    } finally {
        await disconnectFromDB(); // Ensure the connection is closed
    }
}

testDB();
