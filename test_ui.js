const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await page.goto('http://127.0.0.1:8000/');
    // wait for input
    await page.waitForSelector('input[placeholder]');
    // add a known YouTube video
    await page.fill('input[placeholder]', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await page.click('button[type="submit"]');
    // wait for card to appear
    await page.waitForSelector('.card');
    const thumb = await page.$('.card .thumb img');
    if (!thumb) throw new Error('Thumbnail not found');
    // click the thumbnail to load iframe
    await page.click('.card .thumb');
    // check iframe appears
    await page.waitForSelector('.card iframe', { timeout: 5000 });
    console.log('UI test passed: iframe loaded after click');
  } catch (e) {
    console.error('UI test failed:', e);
    process.exitCode = 2;
  } finally {
    await browser.close();
  }
})();
