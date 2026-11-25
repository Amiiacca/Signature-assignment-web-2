# Lab Guide: Running the Adoptions API

These steps take you from a fresh copy of the project to a working test page.
They're written for Windows and should take about 5 minutes.

## 0. What you need

| Tool | Check it's installed | Get it |
|---|---|---|
| Node.js 18 or newer | `node -v` | <https://nodejs.org> |
| MongoDB Server | `mongod --version` | <https://www.mongodb.com/try/download/community> |
| *(Optional)* MongoDB Database Tools (`mongoimport`) | `mongoimport --version` | <https://www.mongodb.com/try/download/database-tools> |
| *(Optional)* MongoDB Shell (`mongosh`) | `mongosh --version` | <https://www.mongodb.com/try/download/shell> |

> If `mongod` says "not recognized", it is installed but not on your PATH. Use the full path:
> `& "C:\Program Files\MongoDB\Server\9.0\bin\mongod.exe"`. Change `9.0` to your version.

---

## Step 1: Start MongoDB (Terminal 1)

On Windows, MongoDB usually installs as a service that starts on its own. Check whether it's running:

```powershell
Get-Service MongoDB
```

If it says **Running**, skip to Step 2. If not, start the server yourself and **leave this terminal open**:

```powershell
mkdir C:\data\db -Force
mongod --dbpath C:\data\db
```

Wait until you see `Waiting for connections` with port `27017`.

---

## Step 2: Install the project (Terminal 2)

Open a second terminal in the project folder:

```powershell
cd "C:\Users\LEGION PRO 7\Documents\Signature assignment web 2"
npm install
```

---

## Step 3: Import the data

Use **one** of these:

```powershell
# Option A: the official tool (needs MongoDB Database Tools)
mongoimport --db project3 --collection adoptions --file data/adoptions.json --jsonArray

# Option B: no extra tools needed
npm run seed
```

You should see **30 documents imported**.

---

## Step 4: Try the sample queries

**With mongosh:**

```powershell
mongosh
```
```js
use project3
db.adoptions.findOne({ AdoptionID: 14 })
db.adoptions.find({ UniversityID: 100724 })
exit
```

**Without mongosh:**

```powershell
npm run queries
```

AdoptionID 14 should come back as a University of Illinois record. UniversityID 100724 (Alabama State University) should return 6 adoptions.

---

## Step 5: Start the API

```powershell
npm start
```

You should see:

```
Connected to MongoDB: project3.adoptions
API running at http://localhost:3000/api/adoptions
Test page at   http://localhost:3000/
```

Leave it running. Press **Ctrl + C** to stop it later.

Quick check in a browser. Each link should return JSON:

- <http://localhost:3000/api/adoptions>: all 30 adoptions, sorted by date
- <http://localhost:3000/api/adoptions/14>: one adoption
- <http://localhost:3000/api/adoptions/university/100724>: 6 adoptions

---

## Step 6: Use the test page

1. Open **<http://localhost:3000/>**.
2. Click **Run test** on each of the three cards. Each one shows `HTTP 200` and a table of results.
   - Change the **AdoptionID** or **UniversityID** box to try other values. Try `9999` to see a 404.
   - Expand **Raw JSON** to see the exact response.
3. Click **Run all checks**. All 5 lines should show **PASS**.

> **Testing from another domain (CORS):** you can open `public/index.html` from somewhere else, for
> example VS Code's *Live Server* on port 5500. Keep `http://localhost:3000` in the **API base URL**
> box. It still works because the API sends `Access-Control-Allow-*` headers.

---

## Step 7: Review the validation work

Open [docs/VALIDATION_REPORT.md](docs/VALIDATION_REPORT.md). In VS Code, press **Ctrl + Shift + V** to preview it with the screenshots.

To validate again yourself:

1. **HTML:** go to <https://validator.w3.org/nu/#textarea>, paste the contents of `public/index.html`, and click **Check**.
2. **CSS:** go to <https://jigsaw.w3.org/css-validator/#validate_by_input>, paste the contents of `public/css/styles.css`,
   open **More Options**, set *Warnings* to **All**, and click **Check**.

Both should report no errors and no warnings.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Could not start server: connect ECONNREFUSED 127.0.0.1:27017` | MongoDB isn't running. Go back to Step 1. |
| `EADDRINUSE: address already in use :::3000` | Another program is using port 3000. Run `$env:PORT=3001; npm start` and open `http://localhost:3001/`. |
| Routes return `[]` or 404 for everything | The data wasn't imported into **project3**. Run `npm run seed`. |
| Test page says *Request failed… Is the API running?* | Start the API (Step 5) and check that the **API base URL** box matches its address. |
| Data imported twice with `mongoimport` | Run `npm run seed`. It clears the collection and imports a fresh copy. |
