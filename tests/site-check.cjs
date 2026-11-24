// Author: Snowball
// Run with an installed Playwright module; no production dependencies are needed.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const root = path.resolve(__dirname, '..');
const output = process.env.SITE_CHECK_OUTPUT || path.join(os.tmpdir(), 'snowball-site-check');
const group = process.env.SITE_CHECK_GROUP || 'all';
assert(['all', 'layout', 'gallery'].includes(group), 'SITE_CHECK_GROUP must be all, layout, or gallery');
const pages = ['index', 'research', 'publications', 'photography', 'about'];
const viewports = [
  [1920, 1080], [1440, 1000], [1440, 900], [1161, 900], [1160, 900],
  [1101, 900], [1100, 900], [1024, 900], [901, 900], [900, 900],
  [768, 1024], [521, 844], [520, 844], [390, 844], [390, 700],
  [320, 740], [844, 390], [667, 375],
];
const report = { group, views: [], galleryRecovery: [], internalLinks: [] };
const references = new Set();
const pageIds = new Map();
const mime = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.pdf': 'application/pdf',
  '.ico': 'image/x-icon',
};
fs.mkdirSync(output, { recursive: true });

const server = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');
  const file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(response);
});

async function screenshot(page, name) {
  await page.screenshot({ path: path.join(output, name + '.png') });
}

async function waitForGallery(page) {
  await page.waitForFunction(() => document.querySelectorAll('.photo-card').length === 36);
}

let browser;
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true });
  for (const [width, height] of group === 'gallery' ? [] : viewports) {
    const context = await browser.newContext({ viewport: { width, height } });
    for (const name of pages) {
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => {
        if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
      });
      await page.goto(`${base}/${name}.html`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      if (name === 'photography') await waitForGallery(page);
      await screenshot(page, `${name}-${width}x${height}`);
      const layout = await page.evaluate(() => {
        const clipped = [];
        for (const element of document.querySelectorAll('.focus-row span, .publication-year-group h3, .about-interest-card strong')) {
          if (!element.getClientRects().length) continue;
          const range = document.createRange();
          range.selectNodeContents(element);
          const text = range.getBoundingClientRect();
          const box = (element.closest('.about-interest-card') || element).getBoundingClientRect();
          if (text.left < box.left - 1 || text.right > box.right + 1) clipped.push(element.textContent.trim());
        }
        return { scrollWidth: document.documentElement.scrollWidth, clipped };
      });
      assert(layout.scrollWidth <= width + 1, `${name} ${width}: horizontal overflow`);
      assert.deepEqual(layout.clipped, [], `${name} ${width}: clipped text`);
      if (width === 1440 && height === 1000) {
        const links = await page.locator('a[href], img[src], link[href], script[src], source[srcset]').evaluateAll(elements => elements.map(e => e.href || e.src || e.srcset));
        for (const value of links) {
          if (!value) continue;
          const url = new URL(value, `${base}/${name}.html`);
          if (url.origin === base) references.add(url.pathname + url.hash);
        }
        pageIds.set(`/${name}.html`, await page.locator('[id]').evaluateAll(elements => elements.map(e => e.id)));
      }
      if (width <= 900) {
        const toggle = page.locator('[data-nav-toggle]');
        await toggle.click();
        assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
        assert(await page.locator('[data-nav-links]').isVisible());
        await toggle.click();
        assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
      }
      if (name === 'index') {
        const visibleNews = page.locator('.timeline-news-item:visible');
        assert.equal(await visibleNews.count(), 6);
        const news = await visibleNews.allTextContents();
        assert(news.some(text => text.includes('ECA:')));
        assert(news.some(text => text.includes('WestWorld:') && text.includes('Spotlight')));
        assert.equal(await page.locator('.timeline-news-item[data-swan-preview]').count(), 2);
        assert.equal(await page.locator('#news-swan-workshop a[href*="arxiv"]').count(), 0);
        assert((await page.locator('#news-slow-fast-anomaly-detection').innerText()).includes('2026.09'));
        assert.equal(await page.locator('.selected-paper').filter({ hasText: 'ODESteer:' }).locator('.paper-role').innerText(), 'Second author');
        const toggle = page.locator('[data-news-toggle]');
        await toggle.click();
        assert(await page.locator('[data-news-extra]:visible').count() > 0);
        await toggle.click();
        assert.equal(await page.locator('[data-news-extra]:visible').count(), 0);
        assert.equal(await page.locator('.compact-experience article').count(), 5);
        assert((await page.locator('.doctoral-experience').innerText()).includes('William & Mary'));
        if ((width === 1440 && height === 1000) || (width === 390 && height === 844)) {
          await page.locator('.compact-experience').screenshot({ path: path.join(output, `experience-${width}.png`) });
          await page.locator('.news-timeline').screenshot({ path: path.join(output, `news-${width}.png`) });
        }
        const figures = page.locator('.selected-paper img');
        for (let i = 0; i < await figures.count(); i++) {
          const figure = figures.nth(i);
          assert.equal(await figure.getAttribute('loading'), 'lazy');
          await figure.scrollIntoViewIfNeeded();
          await figure.evaluate(image => image.decode());
          assert(await figure.evaluate(image => image.naturalWidth > 0));
        }
      }
      if (name === 'photography') {
        assert(await page.locator('[data-photo-status]').isHidden());
        assert(await page.locator('[data-photo-retry]').isHidden());
        await page.locator('.photo-card').first().click();
        await page.locator('dialog img').evaluate(image => image.decode());
        assert(await page.locator('dialog').evaluate(dialog => dialog.open));
        await screenshot(page, `lightbox-${width}x${height}`);
        await page.keyboard.press('Escape');
        assert(await page.locator('dialog').evaluate(dialog => !dialog.open));
        assert(await page.evaluate(() => document.activeElement.classList.contains('photo-card')));
        await page.keyboard.press('Enter');
        assert(await page.locator('dialog').evaluate(dialog => dialog.open));
        await page.locator('[data-photo-lightbox-close]').click();
      }
      if (name === 'about' && width === 320) {
        await page.locator('.about-interest-grid').screenshot({ path: path.join(output, 'about-bubbles-320.png') });
      }
      if (name === 'publications' && width === 1440 && height === 1000) {
        await page.locator('.publication-year-group').last().screenshot({ path: path.join(output, 'earlier-desktop.png') });
        const swan = JSON.parse(fs.readFileSync(path.join(root, 'data/publications.json'), 'utf8'))[0];
        assert.equal(await page.locator('#swan h4').innerText(), swan.title);
        assert(swan.title.startsWith('Fast World Planner:'));
        assert.equal(await page.locator('#swan sup').allTextContents().then(items => items.join('')), '**\u2020\u2020\u2020');
      }
      assert.deepEqual(errors, [], `${name} ${width}: browser or resource errors`);
      report.views.push({ page: name, width, height, passed: true });
      await page.close();
    }
    await context.close();
    console.log(`PASS five pages at ${width}x${height}`);
  }

  for (const reference of references) {
    const url = new URL(reference, base);
    assert(fs.existsSync(path.join(root, decodeURIComponent(url.pathname))), `Missing file: ${reference}`);
    if (url.hash && pageIds.has(url.pathname)) assert(pageIds.get(url.pathname).includes(decodeURIComponent(url.hash.slice(1))), `Missing anchor: ${reference}`);
    report.internalLinks.push(reference);
  }
  if (group === 'layout') {
    console.log(`PASS ${report.views.length} responsive views and ${report.internalLinks.length} local links`);
    return;
  }
  if (group === 'all') {
    await browser.close();
    browser = await chromium.launch({ headless: true });
  }

  // Request failures, bad data, and a successful retry must use the same gallery UI.
  for (const failure of ['network', 'http', 'json', 'schema', 'timeout']) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    let attempt = 0;
    await page.route('**/data/photos.json', async route => {
      attempt++;
      if (attempt > 1) return route.continue();
      if (failure === 'network') return route.abort('failed');
      if (failure === 'http') return route.fulfill({ status: 503, body: 'Unavailable' });
      if (failure === 'json') return route.fulfill({ status: 200, contentType: 'application/json', body: '{' });
      if (failure === 'schema') return route.fulfill({ status: 200, contentType: 'application/json', body: '[{}]' });
      // Leave the request pending so the production timeout, not a mock, aborts it.
    });
    await page.goto(`${base}/photography.html`, { waitUntil: 'domcontentloaded' });
    const retry = page.locator('[data-photo-retry]');
    await retry.waitFor({ state: 'visible', timeout: 20000 });
    assert((await page.locator('[data-photo-status]').innerText()).includes('could not be loaded'));
    assert.equal(await page.locator('[data-photo-grid]').getAttribute('aria-busy'), 'false');
    if (failure === 'network') await page.locator('#gallery').screenshot({ path: path.join(output, 'gallery-error.png') });
    await retry.click();
    await waitForGallery(page);
    assert(await retry.isHidden());
    assert(await page.locator('[data-photo-status]').isHidden());
    assert(await page.evaluate(() => document.activeElement.classList.contains('photo-card')));
    assert.equal(attempt, 2);
    report.galleryRecovery.push({ failure, passed: true });
    console.log(`PASS gallery ${failure} failure and retry`);
    await page.close();
  }

  const emptyPage = await browser.newPage();
  await emptyPage.route('**/data/photos.json', route => route.fulfill({ contentType: 'application/json', body: '[]' }));
  await emptyPage.goto(`${base}/photography.html`, { waitUntil: 'networkidle' });
  assert.equal(await emptyPage.locator('[data-photo-count]').textContent(), '0 Frames');
  assert.equal(await emptyPage.locator('[data-photo-status]').innerText(), 'No photographs are available yet.');
  assert(await emptyPage.locator('[data-photo-retry]').isHidden());
  await emptyPage.close();
  report.emptyGallery = true;

  for (const width of [1440, 320]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(`${base}/photography.html`);
    await waitForGallery(page);
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
    const cards = page.locator('.photo-card');
    for (let i = 0; i < 36; i++) {
      await cards.nth(i).click();
      await page.locator('dialog img').evaluate(image => image.decode());
      const inside = await page.locator('dialog').evaluate(dialog => {
        const rect = dialog.getBoundingClientRect();
        return dialog.open && rect.left >= 0 && rect.top >= 0 && rect.right <= innerWidth + 1 && rect.bottom <= innerHeight + 1;
      });
      assert(inside, `Photo ${i} outside viewport at ${width}`);
      await page.keyboard.press('Escape');
    }
    await page.close();
  }
  report.photoDialogs = 72;

  const touchContext = await browser.newContext({
    viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3,
  });
  const touchPage = await touchContext.newPage();
  await touchPage.goto(`${base}/photography.html`);
  await waitForGallery(touchPage);
  for (const [width, height, columns] of [[390, 844, 1], [844, 390, 2], [390, 844, 1]]) {
    await touchPage.setViewportSize({ width, height });
    await touchPage.waitForFunction(count => document.querySelectorAll('.photo-column').length === count, columns);
    assert.equal(await touchPage.locator('.photo-card').count(), 36);
    await touchPage.locator('[data-nav-toggle]').tap();
    assert.equal(await touchPage.locator('[data-nav-toggle]').getAttribute('aria-expanded'), 'true');
    await touchPage.locator('[data-nav-toggle]').tap();
    await touchPage.locator('.photo-card').first().tap();
    await touchPage.locator('dialog img').evaluate(image => image.decode());
    assert(await touchPage.locator('dialog').evaluate(dialog => dialog.open));
    await touchPage.locator('[data-photo-lightbox-close]').tap();
    assert(await touchPage.locator('dialog').evaluate(dialog => !dialog.open));
  }
  await touchContext.close();
  report.touchOrientationChanges = 3;
  console.log('PASS 72 photo dialogs, five failure/retry scenarios, empty state, and touch rotation');
  if (group === 'all') console.log(`PASS ${report.views.length} responsive views and ${report.internalLinks.length} local links`);
})().catch(error => {
  report.failure = error.stack;
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
});
