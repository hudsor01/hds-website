#!/usr/bin/env npx tsx

/**
 * Visual Demo of Enhanced Contact Form
 * Shows all the modern UI components in action
 */

import { chromium } from 'playwright'

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  console.log('🎨 Enhanced Contact Form Demo\n')
  console.log('This demo will showcase the modern UI components:\n')
  console.log('  • FloatingInput with animated labels')
  console.log('  • CustomSelect with smooth dropdowns')
  console.log('  • FloatingTextarea with character count')
  console.log('  • Beautiful gradient backgrounds')
  console.log('  • Interactive submit button\n')
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // Slow down actions for visibility
  })
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  })
  
  const page = await context.newPage()
  
  console.log('📍 Navigating to contact page...')
  await page.goto('http://localhost:3000/contact', { waitUntil: 'networkidle' })
  await sleep(1000)
  
  console.log('\n✨ Demonstrating FloatingInput components...')
  
  // First Name with floating label
  console.log('  → Filling First Name (watch the label float)')
  const firstName = await page.locator('input[name="firstName"]')
  await firstName.click()
  await sleep(500)
  await firstName.type('John', { delay: 100 })
  
  // Last Name
  console.log('  → Filling Last Name')
  const lastName = await page.locator('input[name="lastName"]')
  await lastName.click()
  await sleep(500)
  await lastName.type('Doe', { delay: 100 })
  
  // Email
  console.log('  → Filling Email Address')
  const email = await page.locator('input[name="email"]')
  await email.click()
  await sleep(500)
  await email.type('john.doe@example.com', { delay: 50 })
  
  // Phone (optional)
  console.log('  → Filling Phone Number (optional field)')
  const phone = await page.locator('input[name="phone"]')
  await phone.click()
  await sleep(500)
  await phone.type('555-123-4567', { delay: 50 })
  
  // Company (optional)
  console.log('  → Filling Company Name')
  const company = await page.locator('input[name="company"]')
  await company.click()
  await sleep(500)
  await company.type('Acme Corporation', { delay: 50 })
  
  console.log('\n🎯 Demonstrating CustomSelect dropdowns...')
  
  // Service Selection
  console.log('  → Opening Service dropdown')
  const serviceButton = await page.locator('button[id="service"]')
  await serviceButton.click()
  await sleep(1000)
  
  console.log('  → Selecting "Custom Development"')
  await page.locator('text="Custom Development"').click()
  await sleep(500)
  
  // Best Time to Contact
  console.log('  → Opening Contact Time dropdown')
  const timeButton = await page.locator('button[id="bestTimeToContact"]')
  await timeButton.click()
  await sleep(1000)
  
  console.log('  → Selecting "Morning (9 AM - 12 PM)"')
  await page.locator('text="Morning (9 AM - 12 PM)"').click()
  await sleep(500)
  
  console.log('\n📝 Demonstrating FloatingTextarea...')
  
  // Message
  console.log('  → Typing message (watch character count)')
  const message = await page.locator('textarea[name="message"]')
  await message.click()
  await sleep(500)
  
  const messageText = 'I would like to discuss a new web application project. ' +
                      'We need a modern, responsive design with excellent performance. ' +
                      'Looking forward to hearing from you!'
  
  await message.type(messageText, { delay: 30 })
  await sleep(1000)
  
  console.log('\n🚀 Demonstrating form submission...')
  console.log('  → Hovering over submit button (watch the shine effect)')
  
  const submitButton = await page.locator('button[type="submit"]')
  await submitButton.hover()
  await sleep(1000)
  
  console.log('  → Clicking submit button')
  await submitButton.click()
  
  console.log('  → Form is submitting (watch the loading spinner)')
  await sleep(2000)
  
  // Check for success or error
  const successVisible = await page.locator('text=/success|sent/i').isVisible().catch(() => false)
  const errorVisible = await page.locator('text=/error|failed/i').isVisible().catch(() => false)
  
  if (successVisible) {
    console.log('\n✅ Form submitted successfully!')
  } else if (errorVisible) {
    console.log('\n⚠️  Form showed an error (this is normal in demo)')
  } else {
    console.log('\n📋 Form was submitted')
  }
  
  console.log('\n🎉 Demo complete!')
  console.log('\nThe enhanced contact form features:')
  console.log('  ✓ Modern floating label inputs')
  console.log('  ✓ Smooth animated dropdowns')
  console.log('  ✓ Character count for textarea')
  console.log('  ✓ Beautiful gradient backgrounds')
  console.log('  ✓ Interactive hover effects')
  console.log('  ✓ Loading states with spinners')
  console.log('  ✓ Fully accessible components')
  
  console.log('\n💡 Browser will close in 5 seconds...')
  await sleep(5000)
  
  await browser.close()
}

main().catch(error => {
  console.error('❌ Demo failed:', error)
  process.exit(1)
})