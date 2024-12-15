const { MongoClient } = require('mongodb');
let database = null;

async function connect() {
    try {
        const uri = process.env.MONGO_URI;
        const client = new MongoClient(uri);
        await client.connect();
        console.log('Connected to MongoDB Atlas');
        database = client.db('test');
    } catch (err) {
        console.error('Error connecting to MongoDB Atlas:', err);
    }
}

function getDatabase() {
    return database;
}

module.exports = { connect, getDatabase };
