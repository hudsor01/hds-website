import { readFileSync, writeFileSync } from 'fs'
import { glob } from 'glob'

// Function to escape quotes in JSX
function escapeJSXEntities(content) {
  // Replace unescaped single quotes with proper HTML entity
  content = content.replace(/([^\\])'([^s])/g, '$1&apos;$2')
  content = content.replace(/^'([^s])/g, '&apos;$1')
  
  // Replace unescaped double quotes with proper HTML entity
  content = content.replace(/([^\\])"([^>])/g, '$1&quot;$2')
  content = content.replace(/^"([^>])/g, '&quot;$1')
  
  return content
}

// Get all TSX files
const files = [
  '/Users/richard/business-website/app/blog/error.tsx',
  '/Users/richard/business-website/app/book-consultation/page.tsx',
  '/Users/richard/business-website/app/case-studies/page.tsx',
  '/Users/richard/business-website/app/contact/error.tsx',
  '/Users/richard/business-website/app/contact/page.tsx',
  '/Users/richard/business-website/app/dallas-revenue-operations/page.tsx',
  '/Users/richard/business-website/app/not-found.tsx',
  '/Users/richard/business-website/app/page.tsx',
  '/Users/richard/business-website/app/portfolio/page.tsx',
  '/Users/richard/business-website/app/privacy/page.tsx',
  '/Users/richard/business-website/app/services/error.tsx',
  '/Users/richard/business-website/app/services/not-found.tsx',
  '/Users/richard/business-website/app/services/page.tsx',
  '/Users/richard/business-website/app/terms/page.tsx',
  '/Users/richard/business-website/app/tools/website-audit/page.tsx',
  '/Users/richard/business-website/app/tools/website-audit/website-audit-tool.tsx'
]

files.forEach(file => {
  try {
    const content = readFileSync(file, 'utf8')
    const fixed = escapeJSXEntities(content)
    
    if (content !== fixed) {
      writeFileSync(file, fixed)
      console.log(`Fixed: ${file}`)
    }
  } catch (error) {
    console.log(`Error processing ${file}:`, error.message)
  }
})

console.log('Finished fixing React entities')