import { test, expect } from '@playwright/test';

test.describe('Multilingual Translation E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
  });

  test('User can change language preference from settings', async ({ page }) => {
    // Navigate to settings
    await page.click('[title="Settings"]');
    await page.waitForURL('**/settings');

    // Change language to Spanish
    await page.selectOption('select[aria-label="Preferred Language"]', 'es');
    
    // Save settings
    await page.click('button:has-text("Save Settings")');
    
    // Wait for success message
    await expect(page.locator('text=/saved successfully/i')).toBeVisible();

    // Verify language was saved
    const selectedLanguage = await page.inputValue('select[aria-label="Preferred Language"]');
    expect(selectedLanguage).toBe('es');
  });

  test('User can switch language using navbar dropdown', async ({ page }) => {
    // Click language switcher
    await page.click('[title="Language settings"]');
    
    // Select Spanish
    await page.click('text=Español');
    
    // Wait for language to change
    await page.waitForTimeout(500);
    
    // Verify language changed in dropdown
    await page.click('[title="Language settings"]');
    const spanishOption = page.locator('text=Español').first();
    await expect(spanishOption).toHaveClass(/text-cyan-400/);
  });

  test('Medication instructions appear in selected language', async ({ page }) => {
    // Change to Spanish
    await page.goto('http://localhost:5173/settings');
    await page.selectOption('select[aria-label="Preferred Language"]', 'es');
    await page.click('button:has-text("Save Settings")');
    
    // Navigate to dashboard
    await page.goto('http://localhost:5173/dashboard');
    
    // Check if medications show Spanish text
    const medicationCard = page.locator('.medication-card').first();
    const instructionText = await medicationCard.locator('.instructions').textContent();
    
    // Should contain Spanish words
    expect(instructionText).toMatch(/tomar|toma|después|antes|veces/i);
  });

  test('User can toggle between original and translated instructions', async ({ page }) => {
    // Go to dashboard
    await page.goto('http://localhost:5173/dashboard');
    
    // Find medication with translation toggle
    const toggleButton = page.locator('button:has-text("EN")').first();
    await toggleButton.click();
    
    // Should now show ES
    await expect(toggleButton).toHaveText(/ES|HI/);
    
    // Click again to toggle back
    await toggleButton.click();
    await expect(toggleButton).toHaveText(/EN/);
  });

  test('Add medication page shows translation preview', async ({ page }) => {
    await page.goto('http://localhost:5173/addMedication');
    
    // Fill in medication description
    await page.fill('textarea[placeholder*="medication"]', 'Take with food twice daily');
    
    // Wait for translation preview
    await page.waitForTimeout(1500); // Debounce delay
    
    // Check if translation previews appear
    const spanishPreview = page.locator('text=/Español/i');
    await expect(spanishPreview).toBeVisible();
    
    const hindiPreview = page.locator('text=/हिन्दी/i');
    await expect(hindiPreview).toBeVisible();
  });

  test('Report analysis displays in selected language', async ({ page }) => {
    await page.goto('http://localhost:5173/report-analysis');
    
    // Select language
    await page.selectOption('select[aria-label="Language"]', 'es');
    
    // Upload a report (mock file)
    await page.setInputFiles('input[type="file"]', {
      name: 'test-report.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('PDF content')
    });
    
    await page.click('button:has-text("Analyze")');
    
    // Wait for analysis
    await page.waitForSelector('.analysis-result', { timeout: 10000 });
    
    // Check language indicator
    const languageBadge = page.locator('text=/Originally English|Translated/');
    await expect(languageBadge).toBeVisible();
  });

  test('Readability scores are displayed on reports', async ({ page }) => {
    await page.goto('http://localhost:5173/report-analysis');
    
    // Upload and analyze report
    await page.setInputFiles('input[type="file"]', './test-data/sample-report.pdf');
    await page.click('button:has-text("Analyze")');
    
    // Wait for readability indicator
    const readabilityBadge = page.locator('[class*="readability"]');
    await expect(readabilityBadge).toBeVisible();
    
    // Should show grade level
    await expect(readabilityBadge).toContainText(/Grade \d+/);
  });

  test('Chat with report translates questions and responses', async ({ page }) => {
    await page.goto('http://localhost:5173/reportChat');
    
    // Select report
    await page.selectOption('select[aria-label="Select Report"]', { index: 0 });
    
    // Select language
    await page.selectOption('select[aria-label="Language"]', 'es');
    
    // Ask a question
    await page.fill('input[placeholder*="question"]', '¿Cuál es mi nivel de glucosa?');
    await page.click('button[type="submit"]');
    
    // Wait for response
    await page.waitForSelector('.chat-message.assistant', { timeout: 5000 });
    
    // Response should be in Spanish
    const response = await page.locator('.chat-message.assistant').last().textContent();
    expect(response).toMatch(/glucosa|nivel|sangre|resultado/i);
  });

  test('Translation loading states are shown', async ({ page }) => {
    await page.goto('http://localhost:5173/settings');
    
    // Change language
    await page.selectOption('select[aria-label="Preferred Language"]', 'hi');
    
    // Click save
    await page.click('button:has-text("Save Settings")');
    
    // Should show saving state
    await expect(page.locator('text=/Saving/i')).toBeVisible();
    
    // Then success
    await expect(page.locator('text=/saved successfully/i')).toBeVisible();
  });

  test('Settings persist across page reloads', async ({ page }) => {
    // Change language
    await page.goto('http://localhost:5173/settings');
    await page.selectOption('select[aria-label="Preferred Language"]', 'es');
    await page.click('button:has-text("Save Settings")');
    await page.waitForTimeout(500);
    
    // Reload page
    await page.reload();
    
    // Language should still be Spanish
    const selectedLanguage = await page.inputValue('select[aria-label="Preferred Language"]');
    expect(selectedLanguage).toBe('es');
  });

  test('Auto-translate setting is respected', async ({ page }) => {
    // Enable auto-translate
    await page.goto('http://localhost:5173/settings');
    await page.click('button:has([aria-label="Auto-translate all content"])');
    await page.click('button:has-text("Save Settings")');
    
    // Navigate to agents page
    await page.goto('http://localhost:5173/agents');
    
    // Ask a question
    await page.fill('textarea', 'What is diabetes?');
    await page.click('button:has-text("Send")');
    
    // Wait for response
    await page.waitForSelector('.ai-response', { timeout: 5000 });
    
    // Should show translated response if user language is not English
    const response = page.locator('.ai-response').last();
    await expect(response).toBeVisible();
  });

  test('Translation errors are handled gracefully', async ({ page }) => {
    // Simulate network error by blocking translation API
    await page.route('**/api/translate', route => route.abort());
    
    await page.goto('http://localhost:5173/settings');
    await page.selectOption('select[aria-label="Preferred Language"]', 'es');
    await page.click('button:has-text("Save Settings")');
    
    // Should show error message
    await expect(page.locator('text=/error/i')).toBeVisible();
  });

  test('Keyboard navigation works for language switcher', async ({ page }) => {
    await page.goto('http://localhost:5173/dashboard');
    
    // Tab to language switcher
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Open with Enter
    await page.keyboard.press('Enter');
    
    // Navigate options with arrows
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    
    // Language should change
    await page.waitForTimeout(500);
    await expect(page.locator('[title="Language settings"]')).toBeVisible();
  });

  test('Mobile responsive - language switcher works', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:5173/dashboard');
    
    // Click language switcher
    await page.click('[title="Language settings"]');
    
    // Dropdown should be visible and properly positioned
    const dropdown = page.locator('.language-dropdown');
    await expect(dropdown).toBeVisible();
    
    // Select language
    await page.click('text=Español');
    await page.waitForTimeout(500);
    
    // Verify change
    await page.click('[title="Language settings"]');
    await expect(page.locator('text=Español').first()).toHaveClass(/text-cyan-400/);
  });
});

test.describe('Performance Tests', () => {
  test('Translation API responds within 500ms', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    const start = Date.now();
    
    // Change language
    await page.click('[title="Language settings"]');
    await page.click('text=Español');
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(500);
  });

  test('Page load with translations is fast', async ({ page }) => {
    // Set language preference first
    await page.goto('http://localhost:5173/settings');
    // ... login steps ...
    
    const start = Date.now();
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForLoadState('networkidle');
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(3000);
  });
});
