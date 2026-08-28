import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

for (const path of ['/', '/demo/', '/privacy/', '/terms/', '/404.html']) {
  test(`${path} has the required document structure`, async ({ page }) => {
    const errors = [];
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(path);
    await expect(page).toHaveTitle(/Secret Injection Diff/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('img:not([alt])')).toHaveCount(0);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter(item => ['serious', 'critical'].includes(item.impact))).toEqual([]);
    expect(errors).toEqual([]);
  });
}

for (const path of ['/', '/demo/', '/privacy/', '/terms/', '/404.html']) {
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
