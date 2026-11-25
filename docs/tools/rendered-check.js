// Usage: node rendered-check.js <out dir> <suffix>
// Loads the test page, runs every test, then saves:
//  - rendered DOM HTML (for the Nu validator)
//  - axe-core accessibility results (JSON)
//  - a screenshot of the test page
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const [outDir, suffix] = process.argv.slice(2);
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, defaultViewport: { width: 1366, height: 900 } });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });

  await page.click('button[data-route="all"]');
  await page.click('form[data-route="single"] button');
  await page.click('form[data-route="university"] button');
  await page.click('#run-all');
  await page.waitForFunction(() => document.querySelectorAll('.checks li').length === 5);
  await page.waitForFunction(() => document.querySelectorAll('.table-wrap table').length === 3);
  // Open every Raw JSON panel so its toolbar and highlighted JSON are validated and scanned too
  await page.evaluate(() => document.querySelectorAll('details').forEach(d => { d.open = true; }));
  const statuses = await page.$$eval('.status, .checks li', els => els.map(e => (e.className + ' ' + e.textContent).trim()));
  console.log(statuses.join('\n'));

  const dom = '<!DOCTYPE html>\n' + await page.evaluate(() => document.documentElement.outerHTML);
  fs.writeFileSync(path.join(outDir, `rendered-dom-${suffix}.html`), dom);

  await page.addScriptTag({ path: require.resolve('axe-core') });
  const axe = await page.evaluate(async () => {
    const r = await window.axe.run(document, { resultTypes: ['violations'] });
    return r.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) }));
  });
  fs.writeFileSync(path.join(outDir, `axe-${suffix}.json`), JSON.stringify(axe, null, 2));
  console.log('axe violations:', axe.length);
  axe.forEach(v => console.log(' -', v.impact, v.id, v.help, v.nodes.length, 'node(s)', JSON.stringify(v.nodes.slice(0, 3).map(n => n.target))));

  await page.screenshot({ path: path.join(outDir, `test-page-${suffix}.png`), fullPage: true });
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
