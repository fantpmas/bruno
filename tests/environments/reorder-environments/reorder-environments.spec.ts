import { test, expect } from '../../../playwright';
import fs from 'fs';
import path from 'path';
import { createCollection, createEnvironment, closeAllCollections } from '../../utils/page';

test.describe('Environment Reorder via Drag and Drop', () => {
  test.afterEach(async ({ page }) => {
    await closeAllCollections(page);
  });

  test('should reorder environments via drag and drop and persist seq to yml', async ({ page, createTmpDir }) => {
    test.setTimeout(120000);
    const collectionDir = await createTmpDir('reorder-env-test');

    await test.step('Create collection and first environment', async () => {
      await createCollection(page, 'reorder-env-collection', collectionDir);
      await createEnvironment(page, 'Alpha', 'collection');
    });

    await test.step('Open environment settings and create more environments', async () => {
      // Open the environment settings panel
      await page.getByTestId('environment-selector-trigger').click();
      await page.getByText('Configure', { exact: true }).click();

      const envTab = page.locator('.request-tab').filter({ hasText: 'Environments' });
      await expect(envTab).toBeVisible();

      // Create Beta via the inline "+" button in the environments sidebar
      await page.locator('.sections-container button[title="Create environment"]').click();
      await page.locator('.environment-item.creating .environment-name-input').fill('Beta');
      await page.locator('.environment-item.creating .inline-action-btn.save').click();
      await page.waitForTimeout(500);

      // Create Gamma
      await page.locator('.sections-container button[title="Create environment"]').click();
      await page.locator('.environment-item.creating .environment-name-input').fill('Gamma');
      await page.locator('.environment-item.creating .inline-action-btn.save').click();
      await page.waitForTimeout(500);
    });

    await test.step('Verify initial order is alphabetical', async () => {
      const envNames = page.locator('.environments-list .environment-item:not(.creating) .environment-name');
      await expect(envNames).toHaveCount(3);
      await expect(envNames.nth(0)).toHaveText('Alpha');
      await expect(envNames.nth(1)).toHaveText('Beta');
      await expect(envNames.nth(2)).toHaveText('Gamma');
    });

    await test.step('Drag Gamma above Alpha to reorder', async () => {
      const gammaItem = page.locator('.environments-list .environment-item').filter({ hasText: 'Gamma' });
      const alphaItem = page.locator('.environments-list .environment-item').filter({ hasText: 'Alpha' });

      await gammaItem.dragTo(alphaItem);

      // Wait for the file watcher to pick up the changes
      await page.waitForTimeout(2000);
    });

    await test.step('Verify new order after drag', async () => {
      const envNames = page.locator('.environments-list .environment-item:not(.creating) .environment-name');
      await expect(envNames.nth(0)).toHaveText('Gamma');
      await expect(envNames.nth(1)).toHaveText('Alpha');
      await expect(envNames.nth(2)).toHaveText('Beta');
    });

    await test.step('Verify seq values written to yml files', async () => {
      const envDir = path.join(collectionDir, 'reorder-env-collection', 'environments');

      // Wait a bit for file writes to complete
      await page.waitForTimeout(1000);

      const gammaYml = fs.readFileSync(path.join(envDir, 'Gamma.yml'), 'utf8');
      const alphaYml = fs.readFileSync(path.join(envDir, 'Alpha.yml'), 'utf8');
      const betaYml = fs.readFileSync(path.join(envDir, 'Beta.yml'), 'utf8');

      expect(gammaYml).toContain('seq: 1');
      expect(alphaYml).toContain('seq: 2');
      expect(betaYml).toContain('seq: 3');
    });
  });
});
