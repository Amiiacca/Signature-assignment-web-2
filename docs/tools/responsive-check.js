const puppeteer = require('puppeteer-core');
const [out] = process.argv.slice(2);
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const p = await b.newPage();
  for (const w of [390, 800]) {
    await p.setViewport({ width: w, height: 900 });
    await p.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
    await p.click('form[data-route="single"] button');
    await p.waitForSelector('#single table');
    const info = await p.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, bar: Math.round(document.querySelector('.base-url-bar').getBoundingClientRect().width) }));
    console.log(w, JSON.stringify(info));
    await p.screenshot({ path: `${out}/test-page-final-${w}px.png` });
  }
  await b.close();
})();
