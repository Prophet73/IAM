import puppeteer from 'puppeteer';
import path from 'path';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630 });
  await page.goto(`file://${path.resolve('/opt/enkey/scripts/generate-og.html')}`, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: '/opt/enkey/public/og-image.png' });
  await browser.close();
})();
