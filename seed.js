/*
 * seed.js - loads data/adoptions.json into the "adoptions" collection.
 *
 * Does the same as the command from the assignment:
 *   mongoimport --db project3 --collection adoptions --file data/adoptions.json --jsonArray
 *
 * Use it if the MongoDB Database Tools (mongoimport) are not installed.
 * Usage: node seed.js
 */
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.DB_NAME || 'project3';

async function seed() {
  const file = path.join(__dirname, 'data', 'adoptions.json');
  const adoptions = JSON.parse(fs.readFileSync(file, 'utf8'));

  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const collection = client.db(DB_NAME).collection('adoptions');

    await collection.deleteMany({});            // start clean so the script can be re-run
    const result = await collection.insertMany(adoptions);
    await collection.createIndex({ AdoptionID: 1 }, { unique: true });
    await collection.createIndex({ UniversityID: 1 });

    console.log(`Imported ${result.insertedCount} documents into ${DB_NAME}.adoptions`);
  } finally {
    await client.close();
  }
}

seed().catch(err => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
