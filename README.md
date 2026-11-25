# Adoptions API: Node + Express + MongoDB

A REST API that serves textbook-adoption records from MongoDB, plus a browser test page that calls every route with `fetch()`.

| Route | Returns |
|---|---|
| `GET /api/adoptions` | All adoptions, sorted by `AdoptionDate` (oldest first; add `?order=desc` for newest first) |
| `GET /api/adoptions/:id` | The single adoption whose `AdoptionID` = `:id` (404 if none, 400 if not a number) |
| `GET /api/adoptions/university/:id` | All adoptions whose `UniversityID` = `:id` (404 if none, 400 if not a number) |

## Project structure

```
data/adoptions.json             30 adoption records (created for this assignment)
seed.js                         Node version of the mongoimport command
server.js                       Express API + CORS headers + static test page
queries/                        Sample MongoDB shell queries (mongosh + Node versions)
public/index.html               fetch() test page
public/css/styles.css
public/js/tester.js
docs/VALIDATION_REPORT.md       W3C HTML/CSS validation report
docs/screenshots/               Validator and test-page screenshots
docs/validation-logs/           Raw validator / axe-core output (JSON)
docs/before/                    Round 1: first-draft HTML/CSS (before any fixes)
docs/round2/                    Round 2: after the first set of fixes
docs/round3-ui-update/          Round 3: UI redesign, before its fixes
docs/tools/                     Scripts used to run the validators and take screenshots
docs/evidence/                  Output of the sample queries
```

## 1. Start MongoDB and import the data

Terminal 1: start the database server (skip this if MongoDB already runs as a Windows service):

```bash
mongod --dbpath C:\data\db
```

Terminal 2: import `adoptions.json` into a database called **project3**, collection **adoptions**:

```bash
mongoimport --db project3 --collection adoptions --file data/adoptions.json --jsonArray
```

> `mongoimport` ships in the separate **MongoDB Database Tools** download. If it isn't installed, run
> `npm run seed`. It does the same import with the Node driver and also creates indexes on
> `AdoptionID` and `UniversityID`.
>
> The command in the assignment handout has typos (`-db`, `adoptions. json`, `–jsonArray` with an en dash).
> The correct form is the one shown above.

## 2. Sample queries in the MongoDB shell

```js
use project3
db.adoptions.findOne({ AdoptionID: 14 })          // adoption with AdoptionID = 14
db.adoptions.find({ UniversityID: 100724 })       // all adoptions for UniversityID 100724
```

The full script is `mongosh project3 queries/sample-queries.mongosh.js`. Without mongosh, run `npm run queries`.
Saved output: [docs/evidence/sample-queries-output.txt](docs/evidence/sample-queries-output.txt).

## 3. Run the API

```bash
npm install
npm start          # http://localhost:3000/api/adoptions
```

Environment variables (all optional): `PORT` (3000), `MONGO_URI` (`mongodb://127.0.0.1:27017`), `DB_NAME` (`project3`).

## 4. Test page

Open **http://localhost:3000/**. Each card calls one route. **Run all checks** runs five automated
assertions: the three routes, plus a 404 case and a 400 case.

The API sends `Access-Control-Allow-Origin`, `-Methods` and `-Headers`, so the page also works when opened
from a different origin (for example, `public/index.html` served by VS Code Live Server). Put the
API address in the **API base URL** field.
