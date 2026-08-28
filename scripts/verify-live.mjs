import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from '@playwright/test';

const base = new URL(process.argv[2] ?? 'https://secret-injection-diff.sociobot.in/');
const evidenceDirectory = resolve(process.argv[3] ?? '.factory/evidence/polish-3/live');
const distDirectory = resolve(import.meta.dirname, '../dist/site');
mkdirSync(evidenceDirectory, { recursive: true });

const routes = [
  { path: '/', title: 'Secret Injection Diff — track secret access', canonical: new URL('/', base).href },
  { path: '/demo/?demo=1', title: 'Demo — Secret Injection Diff', canonical: new URL('/demo/', base).href },
  { path: '/privacy/', title: 'Privacy — Secret Injection Diff', canonical: new URL('/privacy/', base).href },
  { path: '/terms/', title: 'Terms — Secret Injection Diff', canonical: new URL('/terms/', base).href },
  { path: '/404.html', title: 'Not found — Secret Injection Diff', canonical: new URL('/404.html', base).href }
];
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 }
];

const browser = await chromium.launch();
const routeResults = [];
const internalLinks = new Set();

for (const viewport of viewports) {
  for (const route of routes) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    page.on('console', message => {
      if (message.type() === 'error') errors.push(message.text());
    });
    const response = await page.goto(new URL(route.path, base).href, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200, `${route.path} should return 200`);
    await page.locator('body').waitFor();
    const structure = await page.evaluate(() => ({
      title: document.title,
      lang: document.documentElement.lang,
      h1: document.querySelectorAll('h1').length,
      main: document.querySelectorAll('main').length,
      missingAlt: document.querySelectorAll('img:not([alt])').length,
      canonical: document.querySelector('link[rel="canonical"]')?.href,
      ogTitle: document.querySelector('meta[property="og:title"]')?.content,
      ogDescription: document.querySelector('meta[property="og:description"]')?.content,
      ogImage: document.querySelector('meta[property="og:image"]')?.content,
      twitterCard: document.querySelector('meta[name="twitter:card"]')?.content,
      appleTouchIcon: document.querySelector('link[rel="apple-touch-icon"]')?.href,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      privacyLink: document.querySelector('footer a[href="/privacy/"]')?.getAttribute('href'),
      termsLink: document.querySelector('footer a[href="/terms/"]')?.getAttribute('href')
    }));
    assert.equal(structure.title, route.title);
    assert.equal(structure.lang, 'en');
    assert.equal(structure.h1, 1);
    assert.equal(structure.main, 1);
    assert.equal(structure.missingAlt, 0);
    assert.equal(structure.canonical, route.canonical);
    assert.ok(structure.ogTitle && structure.ogDescription && structure.ogImage);
    assert.equal(structure.twitterCard, 'summary_large_image');
    assert.ok(structure.appleTouchIcon);
    assert.ok(structure.overflow <= 1, `${route.path} overflows at ${viewport.width}px`);
    assert.equal(structure.privacyLink, '/privacy/');
    assert.equal(structure.termsLink, '/terms/');
    assert.deepEqual(errors, []);
    const axe = await new AxeBuilder({ page }).analyze();
    const serious = axe.violations.filter(item => ['serious', 'critical'].includes(item.impact));
    assert.deepEqual(serious, [], `${route.path} has serious accessibility violations`);
    for (const href of await page.locator('a[href]').evaluateAll(links => links.map(link => link.href))) {
      const url = new URL(href);
      if (url.origin === base.origin) internalLinks.add(`${url.pathname}${url.search}`);
    }
    if (route.path === '/' && viewport.name === 'desktop') {
      await page.screenshot({ path: join(evidenceDirectory, 'landing-desktop.png'), fullPage: true });
    }
    if (route.path === '/' && viewport.name === 'mobile') {
      await page.screenshot({ path: join(evidenceDirectory, 'landing-mobile.png'), fullPage: true });
    }
    if (route.path === '/404.html' && viewport.name === 'mobile') {
      await page.screenshot({ path: join(evidenceDirectory, '404-mobile.png'), fullPage: true });
    }
    routeResults.push({ path: route.path, viewport: viewport.name, structure, seriousAxeViolations: serious.length, errors });
    await context.close();
  }
}

for (const href of internalLinks) {
  const response = await fetch(new URL(href, base));
  assert.ok(response.status < 400, `${href} should resolve, got ${response.status}`);
}

const unknownContext = await browser.newContext({ viewport: viewports[1] });
const unknownPage = await unknownContext.newPage();
const unknownResponse = await unknownPage.goto(new URL('/route-that-does-not-exist', base).href, { waitUntil: 'networkidle' });
assert.equal(unknownResponse.status(), 404);
assert.equal(await unknownPage.title(), 'Not found — Secret Injection Diff');
assert.equal(await unknownPage.locator('h1').textContent(), 'Page not found');
await unknownContext.close();

const demoContext = await browser.newContext({ viewport: viewports[1] });
const demoPage = await demoContext.newPage();
const demoOrigins = new Set();
const demoErrors = [];
demoPage.on('request', request => demoOrigins.add(new URL(request.url()).origin));
demoPage.on('pageerror', error => demoErrors.push(String(error)));
demoPage.on('console', message => {
  if (message.type() === 'error') demoErrors.push(message.text());
});
await demoPage.goto(new URL('/', base).href, { waitUntil: 'networkidle' });
await demoPage.getByRole('link', { name: 'Try it with sample data' }).click();
await demoPage.waitForURL(/\/demo\/\?demo=1$/);
await demoPage.locator('[data-terminal]').filter({ hasText: 'exit 2' }).waitFor();
const firstScreen = await demoPage.locator('[data-terminal]').evaluate(element => {
  const bounds = element.getBoundingClientRect();
  const lastLine = element.lastElementChild?.getBoundingClientRect();
  return { terminalTop: bounds.top, lastLineBottom: lastLine?.bottom ?? bounds.bottom, viewportHeight: window.innerHeight };
});
assert.ok(firstScreen.terminalTop < firstScreen.viewportHeight);
assert.ok(firstScreen.lastLineBottom <= firstScreen.viewportHeight);
const terminalClips = await demoPage.locator('[data-terminal]').evaluate(element => element.scrollWidth > element.clientWidth);
assert.equal(terminalClips, true);
assert.equal(
  await demoPage.getByText('Scroll sideways to read the full command and process path.').isVisible(),
  true
);
await demoPage.screenshot({ path: join(evidenceDirectory, 'demo-first-screen-mobile.png') });
await demoPage.getByRole('button', { name: 'Reset demo' }).click();
assert.equal(await demoPage.locator('[data-demo-status]').textContent(), 'Demo reset. Sample data is ready.');
await demoPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await demoPage.waitForFunction(() => window.scrollY > 500);
const persistentBanner = await demoPage.locator('.demo-banner').evaluate(element => {
  const bounds = element.getBoundingClientRect();
  return { top: bounds.top, bottom: bounds.bottom, position: getComputedStyle(element).position, viewportHeight: window.innerHeight };
});
assert.equal(persistentBanner.position, 'sticky');
assert.ok(persistentBanner.top >= 0 && persistentBanner.bottom <= persistentBanner.viewportHeight);
assert.ok(await demoPage.getByRole('button', { name: 'Reset demo' }).isVisible());
assert.ok(await demoPage.getByRole('link', { name: 'Start for real' }).isVisible());
await demoPage.screenshot({ path: join(evidenceDirectory, 'demo-bottom-mobile.png') });
const browserStorage = await demoPage.evaluate(async () => ({
  localStorage: localStorage.length,
  sessionStorage: sessionStorage.length,
  indexedDb: (await indexedDB.databases()).length,
  caches: await caches.keys(),
  serviceWorkers: (await navigator.serviceWorker.getRegistrations()).length,
  cookies: document.cookie
}));
assert.deepEqual(browserStorage, { localStorage: 0, sessionStorage: 0, indexedDb: 0, caches: [], serviceWorkers: 0, cookies: '' });
assert.deepEqual([...demoOrigins], [base.origin]);
assert.deepEqual(demoErrors, []);

await demoPage.goto(new URL('/', base).href, { waitUntil: 'networkidle' });
await demoPage.getByRole('link', { name: 'Demo' }).focus();
await demoPage.keyboard.press('Enter');
await demoPage.waitForURL(/\/demo\/$/);
await demoPage.waitForFunction(() => document.activeElement?.tagName === 'H1');
assert.equal(await demoPage.evaluate(() => document.activeElement?.tagName), 'H1');
assert.equal(await demoPage.locator('[data-route-status]').textContent(), 'Catch a process gaining a secret name');
await demoPage.goBack({ waitUntil: 'networkidle' });
await demoPage.waitForFunction(() => document.activeElement?.tagName === 'H1');
assert.equal(await demoPage.evaluate(() => document.activeElement?.tagName), 'H1');
assert.equal(await demoPage.locator('[data-route-status]').textContent(), 'Check which process gets each secret name');
await demoPage.goto(new URL('/demo/?demo=1', base).href, { waitUntil: 'networkidle' });
await demoPage.getByRole('link', { name: 'Start for real' }).press('Enter');
await demoPage.waitForURL(/\/#install$/);
await demoPage.waitForFunction(() => document.activeElement?.id === 'install-heading');
assert.equal(await demoPage.evaluate(() => document.activeElement?.id), 'install-heading');
assert.equal(await demoPage.locator('[data-route-status]').textContent(), 'Install the local CLI section');
await demoPage.goto(new URL('/?demo=1', base).href, { waitUntil: 'networkidle' });
await demoPage.waitForURL(/\/demo\/\?demo=1$/);
await demoContext.close();

const factsContext = await browser.newContext({ viewport: viewports[1] });
const factsPage = await factsContext.newPage();
await factsPage.goto(new URL('/', base).href, { waitUntil: 'networkidle' });
assert.equal(await factsPage.locator('h1').textContent(), 'Check which process gets each secret name');
const factBottomEdges = await factsPage.locator('.facts li').evaluateAll(items => items.map(item => item.getBoundingClientRect().bottom));
assert.equal(factBottomEdges.length, 3);
assert.ok(factBottomEdges.every(bottom => bottom <= 844), 'all three first-screen facts should fit at 390px');
await factsContext.close();

const reducedContext = await browser.newContext({ viewport: viewports[1], reducedMotion: 'reduce' });
const reducedPage = await reducedContext.newPage();
await reducedPage.goto(new URL('/', base).href, { waitUntil: 'networkidle' });
const reducedMotion = await reducedPage.evaluate(() => ({
  scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
  capsuleDisplay: getComputedStyle(document.querySelector('.capsule')).display,
  transitionSeconds: Number.parseFloat(getComputedStyle(document.querySelector('.button')).transitionDuration)
}));
assert.deepEqual(reducedMotion, { scrollBehavior: 'auto', capsuleDisplay: 'none', transitionSeconds: 0.00001 });
await reducedContext.close();

const sha256 = value => createHash('sha256').update(value).digest('hex');
const files = readdirSync(distDirectory, { recursive: true, withFileTypes: true })
  .filter(entry => entry.isFile())
  .map(entry => join(entry.parentPath, entry.name))
  .filter(path => !path.endsWith('staticwebapp.config.json'));
const artifactMatches = [];
for (const path of files) {
  const name = relative(distDirectory, path).replaceAll('\\', '/');
  const response = await fetch(new URL(`/${name}`, base), { headers: { 'cache-control': 'no-cache' } });
  assert.equal(response.status, 200, `deployed artifact /${name} should return 200`);
  const local = readFileSync(path);
  const live = Buffer.from(await response.arrayBuffer());
  assert.equal(sha256(live), sha256(local), `deployed /${name} should match dist/site`);
  if (name.startsWith('assets/')) assert.match(response.headers.get('cache-control') ?? '', /immutable/);
  artifactMatches.push(name);
}

const rootResponse = await fetch(base);
const headers = Object.fromEntries(rootResponse.headers);
assert.match(headers['content-security-policy'] ?? '', /default-src 'self'/);
assert.equal(headers['x-content-type-options'], 'nosniff');
assert.equal(headers['referrer-policy'], 'strict-origin-when-cross-origin');
assert.ok(headers['permissions-policy']);

await browser.close();
const report = {
  checkedAt: new Date().toISOString(),
  baseUrl: base.href,
  routeResults,
  unknownRoute: { status: unknownResponse.status(), title: 'Not found — Secret Injection Diff', heading: 'Page not found' },
  demo: { firstScreen, terminalClips, persistentBanner, browserStorage, origins: [...demoOrigins], errors: demoErrors },
  firstScreenFacts: { bottomEdges: factBottomEdges },
  reducedMotion,
  internalLinks: [...internalLinks].sort(),
  artifactMatches,
  securityHeaders: headers
};
writeFileSync(join(evidenceDirectory, 'live-audit.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ routes: routeResults.length, seriousAxeViolations: 0, firstScreen, persistentBanner, browserStorage, artifactsMatched: artifactMatches.length }));
