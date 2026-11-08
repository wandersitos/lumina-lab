import { test, expect } from '@playwright/test';

test('El frontend muestra que conectó con la API', async ({ page }) => {
  // R2: El frontend hace un fetch a la API con éxito.
  await page.goto('http://localhost:3000');
  await expect(page.locator('text=OK')).toBeVisible();
});
