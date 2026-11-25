// Usage: node shoot-validators.js <html file> <css file> <out dir> <suffix>
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const [htmlFile, cssFile, outDir, suffix] = process.argv.slice(2);
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, defaultViewport: { width: 1280, height: 900 } });
  const page = await browser.newPage();

  // --- W3C Nu HTML Checker (text input mode) ---
  await page.goto('https://validator.w3.org/nu/#textarea', { waitUntil: 'networkidle2' });
  await page.$eval('#doc', (el, v) => { el.value = v; }, fs.readFileSync(htmlFile, 'utf8'));
  await page.$eval('#showsource', el => { el.checked = true; }).catch(() => {});
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle2' }), page.click('#submit')]);
  await page.screenshot({ path: path.join(outDir, `html-validator-${suffix}.png`), fullPage: false });

  // --- W3C CSS Validator (direct input) ---
  await page.goto('https://jigsaw.w3.org/css-validator/', { waitUntil: 'networkidle2' });
  await page.$eval('textarea[name="text"]', (el, v) => { el.value = v; }, fs.readFileSync(cssFile, 'utf8'));
  await page.evaluate(() => {
    const form = document.querySelector('textarea[name=text]').form;
    const warn = form.querySelector('select[name="warning"]');
    if (warn) warn.value = '2'; // "All" warnings
    const prof = form.querySelector('select[name="profile"]');
    if (prof) prof.value = 'css3svg';
  });
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
    page.evaluate(() => document.querySelector('textarea[name=text]').form.submit())
  ]);
  await page.screenshot({ path: path.join(outDir, `css-validator-${suffix}.png`), fullPage: true });

  await browser.close();
  console.log('Screenshots saved for', suffix);
})().catch(e => { console.error(e); process.exit(1); });
