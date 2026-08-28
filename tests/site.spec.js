import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const routes = [
  { path: '/', title: 'Secret Injection Diff — track secret access', canonical: 'https://secret-injection-diff.sociobot.in/' },
  { path: '/demo/?demo=1', title: 'Demo — Secret Injection Diff', canonical: 'https://secret-injection-diff.sociobot.in/demo/' },
  { path: '/privacy/', title: 'Privacy — Secret Injection Diff', canonical: 'https://secret-injection-diff.sociobot.in/privacy/' },
  { path: '/terms/', title: 'Terms — Secret Injection Diff', canonical: 'https://secret-injection-diff.sociobot.in/terms/' },
  { path: '/404.html', title: 'Not found — Secret Injection Diff', canonical: 'https://secret-injection-diff.sociobot.in/404.html' }
];

for (const { path } of routes) {
  test(`${path} has the required document structure`, async ({ page }) => {
    const errors = [];
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(path);
    await expect(page).toHaveTitle(/Secret Injection Diff/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('img:not([alt])')).toHaveCount(0);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:description"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveCount(1);
    await expect(page.locator('meta[name="twitter:title"]')).toHaveCount(1);
    await expect(page.locator('meta[name="twitter:description"]')).toHaveCount(1);
    await expect(page.locator('meta[name="twitter:image"]')).toHaveCount(1);
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter(item => ['serious', 'critical'].includes(item.impact))).toEqual([]);
    expect(errors).toEqual([]);
  });
}

for (const { path } of routes) {
  test(`${path} has no serious mobile accessibility violations`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter(item => ['serious', 'critical'].includes(item.impact))).toEqual([]);
  });
}

test('demo controls work with the keyboard', async ({ page }) => {
  await page.goto('/demo/');
  await page.getByRole('button', { name: 'Replay recorded check' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-demo-status]')).toHaveText('Recorded check restarted.');
  await page.getByRole('button', { name: 'Reset demo' }).focus();
  await page.keyboard.press('Space');
  await expect(page.locator('[data-demo-status]')).toHaveText('Demo reset. Sample data is ready.');
});

test('one-click demo query opens isolated sample mode with banner and reset', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\/demo\/\?demo=1$/);
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.locator('[data-terminal]')).toContainText('NPM_TOKEN');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('[data-demo-status]')).toHaveText('Demo reset. Sample data is ready.');
});

test('mobile demo shows the real command, result, and exit status in its first viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo/?demo=1');
  const terminal = page.locator('[data-terminal]');
  await expect(terminal).toContainText('NPM_TOKEN');
  await expect(terminal).toContainText('exit 2');
  const position = await terminal.evaluate(element => {
    const bounds = element.getBoundingClientRect();
    const lastLine = element.lastElementChild?.getBoundingClientRect();
    return {
      top: bounds.top,
      lastLineBottom: lastLine?.bottom ?? bounds.bottom,
      viewportHeight: window.innerHeight
    };
  });
  expect(position.top).toBeLessThan(position.viewportHeight);
  expect(position.lastLineBottom).toBeLessThanOrEqual(position.viewportHeight);
});

test('demo banner and sandbox controls stay visible after mobile scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/demo/?demo=1');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
  const banner = page.locator('.demo-banner');
  await expect(banner).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reset demo' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Start for real' })).toBeVisible();
  const bounds = await banner.evaluate(element => {
    const box = element.getBoundingClientRect();
    return { top: box.top, bottom: box.bottom, viewportHeight: window.innerHeight, position: getComputedStyle(element).position };
  });
  expect(bounds.position).toBe('sticky');
  expect(bounds.top).toBeGreaterThanOrEqual(0);
  expect(bounds.bottom).toBeLessThanOrEqual(bounds.viewportHeight);
});

test('root demo query enters sample mode directly', async ({ page }) => {
  await page.goto('/?demo=1');
  await expect(page).toHaveURL(/\/demo\/\?demo=1$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Catch a process gaining a secret name');
});

test('demo-to-install navigation moves focus, announces the section, and Back restores the demo', async ({ page }) => {
  await page.goto('/demo/?demo=1');
  await page.getByRole('link', { name: 'Start for real' }).press('Enter');
  await expect(page).toHaveURL(/\/#install$/);
  await expect(page.locator('#install-heading')).toBeFocused();
  await expect(page.locator('[data-route-status]')).toHaveText('Install the local CLI section');
  await page.goBack();
  await expect(page).toHaveURL(/\/demo\/\?demo=1$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('full-page navigation and browser Back focus and announce the destination heading', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Demo' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/demo\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(page.locator('[data-route-status]')).toHaveText('Catch a process gaining a secret name');

  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
  await expect(page.locator('[data-route-status]')).toHaveText('Prove which process gets each secret name');
});

test('visitor copy uses the defined product terms and the 404 heading is plain', async ({ page }) => {
  const landing = readFileSync(join(root, 'site/index.html'), 'utf8');
  const demo = readFileSync(join(root, 'site/demo/index.html'), 'utf8');
  const terms = readFileSync(join(root, 'site/terms/index.html'), 'utf8');
  const script = readFileSync(join(root, 'site/main.js'), 'utf8');
  const styles = readFileSync(join(root, 'site/styles.css'), 'utf8');
  const readme = readFileSync(join(root, 'README.md'), 'utf8');
  expect(landing).toContain('Prove which process gets each secret name');
  expect(landing).toContain('Reports secret names · never values');
  expect(`${landing}\n${demo}\n${terms}\n${script}\n${styles}\n${readme}`).not.toMatch(/\bcredential\b|Reports names|\brecipient(s)?\b|\bedges?\b|\bgraph\b|\badapters?\b|\bidentifiers?\b|runtime CDN|Specimen 02|Field method|Known terrain|Outside the fence|To work on each half separately/i);
  expect(readme).not.toMatch(/Rust \d+(?:\.\d+)? or newer/i);
  await page.goto('/404.html');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
});

test('every route has its exact title, canonical URL, and legal links', async ({ page }) => {
  for (const route of routes) {
    await page.goto(route.path);
    await expect(page).toHaveTitle(route.title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', route.canonical);
    await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy/');
    await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Terms' })).toHaveAttribute('href', '/terms/');
  }
});

test('landing page fits a 390px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('landing page reflows without lost content at 200% mobile zoom', async ({ page }) => {
  await page.setViewportSize({ width: 195, height: 422 });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Try it with sample data' })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('reduced motion removes decorative travel and smooth scrolling', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const motion = await page.evaluate(() => ({
    scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    capsuleDisplay: getComputedStyle(document.querySelector('.capsule')).display,
    buttonTransitionSeconds: Number.parseFloat(getComputedStyle(document.querySelector('.button')).transitionDuration)
  }));
  expect(motion.scrollBehavior).toBe('auto');
  expect(motion.capsuleDisplay).toBe('none');
  expect(motion.buttonTransitionSeconds).toBeLessThanOrEqual(0.001);
});

test('mobile navigation targets are at least 44px tall', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const targets = page.locator('.nav-links a, .footer-links a');
  for (const box of await targets.evaluateAll(elements => elements.filter(element => element.getClientRects().length).map(element => element.getBoundingClientRect()))) {
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
});

test('every mobile horizontal scroller is keyboard focusable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/', '/demo/']) {
    await page.goto(path);
    const scrollers = page.locator('pre, .install-code code');
    for (const element of await scrollers.all()) {
      const isScrollable = await element.evaluate(node => node.scrollWidth > node.clientWidth);
      if (isScrollable) await expect(element).toHaveAttribute('tabindex', '0');
    }
  }
});

test('install-panel focus outline contrasts with the paper background', async ({ page }) => {
  await page.goto('/');
  const colors = await page.locator('.copy-button').evaluate(element => {
    element.focus();
    const style = getComputedStyle(element);
    return { outline: style.outlineColor, background: getComputedStyle(element.closest('.install-panel')).backgroundColor };
  });
  expect(colors.outline).toBe('rgb(16, 25, 23)');
  expect(colors.background).toBe('rgb(242, 232, 204)');
});

test('static host config preserves HTTP 404 and gives assets immutable caching', async () => {
  const config = JSON.parse(readFileSync(join(root, 'site/public/staticwebapp.config.json'), 'utf8'));
  expect(config.navigationFallback).toBeUndefined();
  expect(config.responseOverrides['404'].rewrite).toBe('/404.html');
  expect(config.routes.find(route => route.route === '/assets/*').headers['Cache-Control']).toContain('immutable');
});

test('local links resolve', async ({ page, request }) => {
  await page.goto('/');
  const hrefs = await page.locator('a').evaluateAll(links => links.map(link => link.getAttribute('href')).filter(Boolean));
  for (const href of new Set(hrefs.filter(href => href.startsWith('/')))) {
    const target = href.includes('#') ? href.split('#')[0] || '/' : href;
    const response = await request.get(target);
    expect(response.status(), `${target} should resolve`).toBeLessThan(400);
  }
});
