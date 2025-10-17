import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should redirect to sign in page when not authenticated', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/auth/signin')
  })

  test('should show sign in form', async ({ page }) => {
    await page.goto('/auth/signin')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should show validation errors for invalid email', async ({ page }) => {
    await page.goto('/auth/signin')
    
    await page.fill('input[type="email"]', 'invalid-email')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Invalid email')).toBeVisible()
  })

  test('should show Google OAuth button', async ({ page }) => {
    await page.goto('/auth/signin')
    await expect(page.locator('text=Continue with Google')).toBeVisible()
  })

  test('should navigate to sign up page', async ({ page }) => {
    await page.goto('/auth/signin')
    await page.click('text=Sign up')
    await expect(page).toHaveURL('/auth/signup')
  })

  test('should show sign up form with additional fields', async ({ page }) => {
    await page.goto('/auth/signup')
    await expect(page.locator('input[name="fullName"]')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should validate password strength', async ({ page }) => {
    await page.goto('/auth/signup')
    
    await page.fill('input[name="fullName"]', 'John Doe')
    await page.fill('input[type="email"]', 'john@example.com')
    await page.fill('input[type="password"]', '123')
    
    await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible()
  })
})

test.describe('Protected Routes', () => {
  test('should protect dashboard routes', async ({ page }) => {
    const protectedRoutes = [
      '/dashboard',
      '/dashboard/posts',
      '/dashboard/analytics',
      '/dashboard/billing',
      '/dashboard/settings'
    ]

    for (const route of protectedRoutes) {
      await page.goto(route)
      await expect(page).toHaveURL('/auth/signin')
    }
  })
})

test.describe('Authenticated User Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    // Set up authenticated session (you would replace this with actual auth setup)
    await context.addCookies([
      {
        name: 'sb-access-token',
        value: 'mock-access-token',
        domain: 'localhost',
        path: '/',
      }
    ])
  })

  test('should access dashboard when authenticated', async ({ page }) => {
    // This test would need proper setup with a test user
    // For now, it's a placeholder for the authentication flow
    await page.goto('/dashboard')
    // Add assertions based on your dashboard content
  })
})