// Sample queries for the MongoDB shell.
// Run with:  mongosh project3 queries/sample-queries.mongosh.js
// Or type each line inside an interactive `mongosh` session after `use project3`.

// 1. How many adoptions were imported?
print('Total adoptions:', db.adoptions.countDocuments());

// 2. Retrieve the adoption with AdoptionID = 14
printjson(db.adoptions.findOne({ AdoptionID: 14 }));

// 3. Retrieve all adoptions whose UniversityID = 100724
printjson(db.adoptions.find({ UniversityID: 100724 }).toArray());

// 4. Same query, but only show a few fields, newest first
printjson(
  db.adoptions
    .find({ UniversityID: 100724 }, { _id: 0, AdoptionID: 1, AdoptionDate: 1, CourseCode: 1 })
    .sort({ AdoptionDate: -1 })
    .toArray()
);
