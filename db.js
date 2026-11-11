require('dotenv').config();

const { MongoClient } = require('mongodb');

let client;

async function connectToMongoDB() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error('MONGODB_URI is not set. Add it to your .env file.');
    }

    client = new MongoClient(uri);
    await client.connect();
    console.log('Successfully connected to MongoDB.');
    return client;
}

async function disconnectFromMongoDB() {
    if (client) {
        await client.close();
        client = undefined;
    }
}

module.exports = { connectToMongoDB, disconnectFromMongoDB };
