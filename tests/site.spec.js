import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

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

test('local links resolve', async ({ page, request }) => {
  await page.goto('/');
  const hrefs = await page.locator('a').evaluateAll(links => links.map(link => link.getAttribute('href')).filter(Boolean));
  for (const href of new Set(hrefs.filter(href => href.startsWith('/')))) {
    const target = href.includes('#') ? href.split('#')[0] || '/' : href;
    const response = await request.get(target);
    expect(response.status(), `${target} should resolve`).toBeLessThan(400);
  }
});
