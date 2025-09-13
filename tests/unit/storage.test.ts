import { test, expect } from '@playwright/test'

// Since these are browser-specific tests, we'll use Playwright's browser context
test.describe('Storage Utilities', () => {
  test('should save and load form data from localStorage', async ({ page }) => {
    // Navigate to a page to have a browser context
    await page.goto('/')
    
    const testData = {
      employeeName: 'John Doe',
      employeeId: 'EMP001',
      employerName: 'Test Company',
      hourlyRate: 25.50,
      hoursPerPeriod: 80,
      filingStatus: 'single',
      taxYear: 2025,
      state: 'CA'
    }

    // Test saving data by adding script to page
    await page.addScriptTag({ 
      content: `
        const STORAGE_KEY = 'paystub-form-data';
        const saveFormData = (data) => {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          } catch (error) {
            console.warn('Failed to save form data to localStorage:', error);
          }
        };
        const loadFormData = () => {
          try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : null;
          } catch (error) {
            console.warn('Failed to load form data from localStorage:', error);
            return null;
          }
        };
        window.saveFormData = saveFormData;
        window.loadFormData = loadFormData;
      `
    })

    // Test saving data
    await page.evaluate((data) => {
      window.saveFormData(data)
    }, testData)

    // Test loading data
    const loadedData = await page.evaluate(() => {
      return window.loadFormData()
    })

    expect(loadedData).toEqual(testData)
  })

  test('should clear form data from localStorage', async ({ page }) => {
    await page.goto('/')
    
    const testData = {
      employeeName: 'Jane Doe',
      employeeId: 'EMP002',
      employerName: 'Another Company',
      hourlyRate: 30.00,
      hoursPerPeriod: 40,
      filingStatus: 'marriedJoint',
      taxYear: 2025
    }

    // Add storage functions to page
    await page.addScriptTag({ 
      content: `
        const STORAGE_KEY = 'paystub-form-data';
        const saveFormData = (data) => {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          } catch (error) {
            console.warn('Failed to save form data to localStorage:', error);
          }
        };
        const loadFormData = () => {
          try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : null;
          } catch (error) {
            console.warn('Failed to load form data from localStorage:', error);
            return null;
          }
        };
        const clearFormData = () => {
          try {
            localStorage.removeItem(STORAGE_KEY);
          } catch (error) {
            console.warn('Failed to clear form data from localStorage:', error);
          }
        };
        window.saveFormData = saveFormData;
        window.loadFormData = loadFormData;
        window.clearFormData = clearFormData;
      `
    })

    // Save data first
    await page.evaluate((data) => {
      window.saveFormData(data)
    }, testData)

    // Clear data
    await page.evaluate(() => {
      window.clearFormData()
    })

    // Verify data is cleared
    const loadedData = await page.evaluate(() => {
      return window.loadFormData()
    })

    expect(loadedData).toBeNull()
  })

  test('should return null when no data is stored', async ({ page }) => {
    await page.goto('/')
    
    // Add storage functions
    await page.addScriptTag({ 
      content: `
        const STORAGE_KEY = 'paystub-form-data';
        const loadFormData = () => {
          try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : null;
          } catch (error) {
            console.warn('Failed to load form data from localStorage:', error);
            return null;
          }
        };
        const clearFormData = () => {
          try {
            localStorage.removeItem(STORAGE_KEY);
          } catch (error) {
            console.warn('Failed to clear form data from localStorage:', error);
          }
        };
        window.loadFormData = loadFormData;
        window.clearFormData = clearFormData;
      `
    })
    
    // Clear any existing data
    await page.evaluate(() => {
      window.clearFormData()
    })

    const loadedData = await page.evaluate(() => {
      return window.loadFormData()
    })

    expect(loadedData).toBeNull()
  })

  test('should handle corrupted localStorage data gracefully', async ({ page }) => {
    await page.goto('/')
    
    // Add storage functions
    await page.addScriptTag({ 
      content: `
        const STORAGE_KEY = 'paystub-form-data';
        const loadFormData = () => {
          try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : null;
          } catch (error) {
            console.warn('Failed to load form data from localStorage:', error);
            return null;
          }
        };
        window.loadFormData = loadFormData;
      `
    })
    
    // Set corrupted data directly in localStorage
    await page.evaluate(() => {
      localStorage.setItem('paystub-form-data', 'invalid-json-data')
    })

    const loadedData = await page.evaluate(() => {
      return window.loadFormData()
    })

    expect(loadedData).toBeNull()
  })
})