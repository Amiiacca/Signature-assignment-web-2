// Runs the same queries as sample-queries.mongosh.js through the Node driver,
// for machines without mongosh installed.  Usage: node queries/sample-queries.node.js
const { MongoClient } = require('mongodb');

(async () => {
  const client = new MongoClient(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017');
  await client.connect();
  const adoptions = client.db(process.env.DB_NAME || 'project3').collection('adoptions');

  console.log('> db.adoptions.countDocuments()');
  console.log(await adoptions.countDocuments(), '\n');

  console.log('> db.adoptions.findOne({ AdoptionID: 14 })');
  console.dir(await adoptions.findOne({ AdoptionID: 14 }), { depth: null });

  console.log('\n> db.adoptions.find({ UniversityID: 100724 })');
  console.dir(await adoptions.find({ UniversityID: 100724 }).toArray(), { depth: null });

  console.log('\n> db.adoptions.find({ UniversityID: 100724 }, {AdoptionID, AdoptionDate, CourseCode}).sort({ AdoptionDate: -1 })');
  console.table(await adoptions
    .find({ UniversityID: 100724 }, { projection: { _id: 0, AdoptionID: 1, AdoptionDate: 1, CourseCode: 1 } })
    .sort({ AdoptionDate: -1 })
    .toArray());

  await client.close();
})().catch(err => { console.error(err.message); process.exit(1); });
