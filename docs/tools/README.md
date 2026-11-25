# Validation scripts

These are the scripts used to produce the evidence in [`../VALIDATION_REPORT.md`](../VALIDATION_REPORT.md).
They drive a headless Chrome. They aren't part of the app, so their packages aren't in the main `package.json`.

```powershell
npm install --no-save puppeteer-core@23.11.1 axe-core@4.10.2
npm start                                   # in another terminal: the API must be running

# Paste HTML + CSS into the W3C validators and screenshot the result pages
node docs/tools/shoot-validators.js public/index.html public/css/styles.css docs/screenshots final

# Run every test, open the Raw JSON panels, save the rendered DOM, run axe-core, screenshot the page
node docs/tools/rendered-check.js docs/validation-logs final

# Phone (390 px) and tablet (800 px) screenshots
node docs/tools/responsive-check.js docs/screenshots
```

The scripts expect Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe`. Change `CHROME` if it's installed elsewhere.

To get the raw JSON logs, the same files were posted to the validators' JSON endpoints:

```bash
curl -s -H "Content-Type: text/html; charset=utf-8" --data-binary @public/index.html "https://validator.w3.org/nu/?out=json"
curl -s -F "file=@public/css/styles.css;type=text/css" -F profile=css3svg -F warning=2 -F output=json "https://jigsaw.w3.org/css-validator/validator"
```
