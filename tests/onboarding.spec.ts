import { test, expect } from '@playwright/test'

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/onboarding')
  })

  test('should complete full onboarding flow - Tech Startup', async ({ page }) => {
    // Step 1: Business Info
    await expect(page.locator('h1')).toContainText('Welcome to SocialAI')
    await expect(page.locator('text=Step 1 of 4')).toBeVisible()

    await page.fill('input[name="companyName"]', 'TechCorp Inc.')
    await page.selectOption('select[name="industry"]', 'technology')
    await page.selectOption('select[name="companySize"]', '11-50')
    await page.fill('input[name="website"]', 'https://techcorp.com')
    await page.fill('textarea[name="description"]', 'We build innovative software solutions for modern businesses.')

    await page.click('button:has-text("Next")')

    // Step 2: Audience
    await expect(page.locator('text=Step 2 of 4')).toBeVisible()
    await expect(page.locator('text=Define your target audience')).toBeVisible()

    await page.selectOption('select[name="primaryAgeRange"]', '25-34')
    await page.selectOption('select[name="audienceSize"]', 'national')
    await page.fill('input[name="location"]', 'United States')

    // Select interests
    await page.check('input[id="Technology"]')
    await page.check('input[id="Business"]')
    await page.check('input[id="Marketing"]')

    await page.click('button:has-text("Next")')

    // Step 3: Brand Voice
    await expect(page.locator('text=Step 3 of 4')).toBeVisible()
    await expect(page.locator('text=Define your brand voice')).toBeVisible()

    // Adjust sliders (approximate positions)
    await page.locator('input[type="range"]').first().fill('70') // Casual tone
    await page.locator('input[type="range"]').nth(1).fill('60') // Slightly humorous
    await page.locator('input[type="range"]').nth(2).fill('80') // Authoritative

    // Select content types
    await page.check('input[id="educational"]')
    await page.check('input[id="promotional"]')

    await page.selectOption('select[name="postingFrequency"]', 'few-times-week')

    await page.click('button:has-text("Next")')

    // Step 4: Platforms
    await expect(page.locator('text=Step 4 of 4')).toBeVisible()
    await expect(page.locator('text=Choose your social platforms')).toBeVisible()

    // Select platforms
    await page.click('text=Twitter/X')
    await page.click('text=LinkedIn')

    // Select goals
    await page.check('input[id="brand-awareness"]')
    await page.check('input[id="lead-generation"]')

    await page.click('button:has-text("Complete Setup")')

    // Completion step
    await expect(page.locator('text=Welcome to your social media journey!')).toBeVisible()
    await expect(page.locator('text=TechCorp Inc.')).toBeVisible()
    await expect(page.locator('text=Technology')).toBeVisible()
  })

  test('should complete onboarding flow - Local Restaurant', async ({ page }) => {
    // Step 1: Business Info
    await page.fill('input[name="companyName"]', 'Bella Vista Restaurant')
    await page.selectOption('select[name="industry"]', 'food-beverage')
    await page.selectOption('select[name="companySize"]', '2-10')
    await page.fill('textarea[name="description"]', 'Family-owned Italian restaurant serving authentic cuisine since 1985.')

    await page.click('button:has-text("Next")')

    // Step 2: Audience
    await page.selectOption('select[name="primaryAgeRange"]', '35-44')
    await page.selectOption('select[name="audienceSize"]', 'local')
    await page.fill('input[name="location"]', 'San Francisco, CA')

    await page.check('input[id="Food & Cooking"]')
    await page.check('input[id="Family & Parenting"]')
    await page.check('input[id="Lifestyle"]')

    await page.click('button:has-text("Next")')

    // Step 3: Brand Voice
    await page.locator('input[type="range"]').first().fill('80') // Very casual
    await page.locator('input[type="range"]').nth(1).fill('75') // Humorous
    await page.locator('input[type="range"]').nth(2).fill('30') // Approachable

    await page.check('input[id="behind-the-scenes"]')
    await page.check('input[id="user-generated"]')

    await page.selectOption('select[name="postingFrequency"]', 'daily')

    await page.click('button:has-text("Next")')

    // Step 4: Platforms
    await page.click('text=Instagram')
    await page.click('text=Facebook')

    await page.check('input[id="customer-engagement"]')
    await page.check('input[id="community-building"]')

    await page.click('button:has-text("Complete Setup")')

    await expect(page.locator('text=Bella Vista Restaurant')).toBeVisible()
    await expect(page.locator('text=Food & Beverage')).toBeVisible()
  })

  test('should complete onboarding flow - Fitness Coach', async ({ page }) => {
    // Step 1: Business Info
    await page.fill('input[name="companyName"]', 'FitLife Coaching')
    await page.selectOption('select[name="industry"]', 'fitness-wellness')
    await page.selectOption('select[name="companySize"]', '1')
    await page.fill('input[name="website"]', 'https://fitlifecoaching.com')
    await page.fill('textarea[name="description"]', 'Personal fitness coaching and wellness programs for busy professionals.')

    await page.click('button:has-text("Next")')

    // Step 2: Audience
    await page.selectOption('select[name="primaryAgeRange"]', '25-34')
    await page.selectOption('select[name="audienceSize"]', 'regional')
    await page.fill('input[name="location"]', 'California')

    await page.check('input[id="Health & Fitness"]')
    await page.check('input[id="Personal Development"]')
    await page.check('input[id="Lifestyle"]')

    await page.click('button:has-text("Next")')

    // Step 3: Brand Voice
    await page.locator('input[type="range"]').first().fill('60') // Casual
    await page.locator('input[type="range"]').nth(1).fill('40') // Serious but motivational
    await page.locator('input[type="range"]').nth(2).fill('70') // Authoritative

    await page.check('input[id="educational"]')
    await page.check('input[id="inspirational"]')

    await page.selectOption('select[name="postingFrequency"]', 'daily')

    await page.click('button:has-text("Next")')

    // Step 4: Platforms
    await page.click('text=Instagram')
    await page.click('text=TikTok')

    await page.check('input[id="brand-awareness"]')
    await page.check('input[id="lead-generation"]')

    await page.click('button:has-text("Complete Setup")')

    await expect(page.locator('text=FitLife Coaching')).toBeVisible()
    await expect(page.locator('text=Fitness & Wellness')).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    // Try to proceed without filling required fields
    await page.click('button:has-text("Next")')

    await expect(page.locator('text=Please select your industry')).toBeVisible()
    await expect(page.locator('text=Company name must be at least 2 characters')).toBeVisible()
  })

  test('should save progress and allow navigation between steps', async ({ page }) => {
    // Fill step 1
    await page.fill('input[name="companyName"]', 'Test Company')
    await page.selectOption('select[name="industry"]', 'technology')
    await page.fill('textarea[name="description"]', 'Test description for the company.')

    await page.click('button:has-text("Next")')

    // Fill step 2 partially
    await page.selectOption('select[name="primaryAgeRange"]', '25-34')
    await page.fill('input[name="location"]', 'Test Location')

    // Go back to step 1
    await page.click('button:has-text("Previous")')

    // Verify data is preserved
    await expect(page.locator('input[name="companyName"]')).toHaveValue('Test Company')
    await expect(page.locator('textarea[name="description"]')).toHaveValue('Test description for the company.')
  })

  test('should show progress bar correctly', async ({ page }) => {
    await expect(page.locator('text=Step 1 of 4')).toBeVisible()
    await expect(page.locator('text=25% complete')).toBeVisible()

    // Complete step 1
    await page.fill('input[name="companyName"]', 'Test Company')
    await page.selectOption('select[name="industry"]', 'technology')
    await page.fill('textarea[name="description"]', 'Test description.')
    await page.click('button:has-text("Next")')

    await expect(page.locator('text=Step 2 of 4')).toBeVisible()
    await expect(page.locator('text=50% complete')).toBeVisible()
  })

  test('should handle form validation errors gracefully', async ({ page }) => {
    // Step 1: Try invalid website URL
    await page.fill('input[name="companyName"]', 'Test Company')
    await page.selectOption('select[name="industry"]', 'technology')
    await page.fill('input[name="website"]', 'invalid-url')
    await page.fill('textarea[name="description"]', 'Test description.')

    await page.click('button:has-text("Next")')

    await expect(page.locator('text=Please enter a valid website URL')).toBeVisible()

    // Fix the URL
    await page.fill('input[name="website"]', 'https://example.com')
    await page.click('button:has-text("Next")')

    // Should proceed to step 2
    await expect(page.locator('text=Step 2 of 4')).toBeVisible()
  })
})