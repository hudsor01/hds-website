import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'
import fs from 'fs/promises'
import path from 'path'

// PDF styling template
const getHtmlTemplate = (content: string, title: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      margin: 40px;
      line-height: 1.6;
      color: #333;
    }
    h1 {
      color: #0070f3;
      border-bottom: 3px solid #0070f3;
      padding-bottom: 10px;
      margin-bottom: 30px;
    }
    h2 {
      color: #0070f3;
      margin-top: 30px;
      margin-bottom: 15px;
    }
    h3 {
      color: #333;
      margin-top: 20px;
      margin-bottom: 10px;
    }
    ul, ol {
      margin-left: 20px;
      margin-bottom: 15px;
    }
    li {
      margin-bottom: 8px;
    }
    code {
      background-color: #f5f5f5;
      padding: 2px 5px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
    blockquote {
      border-left: 4px solid #0070f3;
      padding-left: 20px;
      margin-left: 0;
      color: #666;
      font-style: italic;
    }
    .header {
      background-color: #0070f3;
      color: white;
      padding: 20px;
      margin: -40px -40px 30px -40px;
      text-align: center;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
    .checklist-item {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
    }
    .checklist-item input[type="checkbox"] {
      margin-right: 10px;
      transform: scale(1.2);
    }
    .resource-section {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0; color: white;">${title}</h1>
    <p style="margin: 10px 0 0 0;">Hudson Digital Solutions</p>
  </div>
  ${content}
  <div class="footer">
    <p>© 2024 Hudson Digital Solutions | Dallas-Fort Worth</p>
    <p>Contact: hello@hudsondigitalsolutions.com | (214) 555-0143</p>
  </div>
</body>
</html>
`

// Pre-built HTML content for each resource
const resourceContent = {
  'website-checklist': `
    <h2>10-Point Website Checklist</h2>
    <p>Use this comprehensive checklist to ensure your website meets modern standards for performance, SEO, and user experience.</p>
    
    <div class="resource-section">
      <h3>Technical Foundation</h3>
      <div class="checklist-item">
        <input type="checkbox"> Mobile responsiveness tested on all devices
      </div>
      <div class="checklist-item">
        <input type="checkbox"> Page load speed under 3 seconds
      </div>
      <div class="checklist-item">
        <input type="checkbox"> SSL certificate installed and working
      </div>
      <div class="checklist-item">
        <input type="checkbox"> Contact forms functional and tested
      </div>
    </div>

    <div class="resource-section">
      <h3>SEO Basics</h3>
      <div class="checklist-item">
        <input type="checkbox"> Title tags optimized for each page
      </div>
      <div class="checklist-item">
        <input type="checkbox"> Meta descriptions written for key pages
      </div>
      <div class="checklist-item">
        <input type="checkbox"> Header tags (H1, H2, H3) properly structured
      </div>
      <div class="checklist-item">
        <input type="checkbox"> Images optimized with alt text
      </div>
    </div>

    <div class="resource-section">
      <h3>User Experience</h3>
      <div class="checklist-item">
        <input type="checkbox"> Clear navigation menu
      </div>
      <div class="checklist-item">
        <input type="checkbox"> Professional design and branding
      </div>
    </div>
  `,
  'contact-form-templates': `
    <h2>5 Contact Form Templates</h2>
    <p>Ready-to-use contact form templates for different business scenarios.</p>
    
    <div class="resource-section">
      <h3>1. Simple Contact Form</h3>
      <p><strong>Best for:</strong> Basic inquiries and general contact</p>
      <ul>
        <li>Name (required)</li>
        <li>Email (required)</li>
        <li>Message (required)</li>
      </ul>
    </div>

    <div class="resource-section">
      <h3>2. Service Inquiry Form</h3>
      <p><strong>Best for:</strong> Service-based businesses</p>
      <ul>
        <li>Name (required)</li>
        <li>Email (required)</li>
        <li>Phone</li>
        <li>Service Interest (dropdown)</li>
        <li>Budget Range</li>
        <li>Project Details (textarea)</li>
      </ul>
    </div>

    <div class="resource-section">
      <h3>3. Consultation Request</h3>
      <p><strong>Best for:</strong> Professional services and consulting</p>
      <ul>
        <li>Name (required)</li>
        <li>Email (required)</li>
        <li>Company</li>
        <li>Phone</li>
        <li>Preferred consultation type (phone/video/in-person)</li>
        <li>Availability</li>
        <li>Challenge description</li>
      </ul>
    </div>

    <div class="resource-section">
      <h3>4. Quote Request Form</h3>
      <p><strong>Best for:</strong> Product or project-based businesses</p>
      <ul>
        <li>Name (required)</li>
        <li>Email (required)</li>
        <li>Company</li>
        <li>Project type</li>
        <li>Timeline</li>
        <li>Budget range</li>
        <li>Detailed requirements</li>
      </ul>
    </div>

    <div class="resource-section">
      <h3>5. Support Request Form</h3>
      <p><strong>Best for:</strong> Customer support and technical issues</p>
      <ul>
        <li>Name (required)</li>
        <li>Email (required)</li>
        <li>Issue priority (dropdown)</li>
        <li>Issue category</li>
        <li>Detailed description</li>
        <li>Screenshots/attachments</li>
      </ul>
    </div>
  `,
  'seo-basics': `
    <h2>SEO Basics Cheat Sheet</h2>
    <p>Essential SEO practices every website owner should know.</p>

    <div class="resource-section">
      <h3>On-Page SEO</h3>
      <ul>
        <li><strong>Title Tags:</strong> 50-60 characters, include primary keyword</li>
        <li><strong>Meta Descriptions:</strong> 150-160 characters, compelling and descriptive</li>
        <li><strong>Header Tags:</strong> Use H1 for main title, H2-H6 for structure</li>
        <li><strong>URL Structure:</strong> Short, descriptive, include keywords</li>
        <li><strong>Internal Linking:</strong> Link to relevant pages within your site</li>
      </ul>
    </div>

    <div class="resource-section">
      <h3>Technical SEO</h3>
      <ul>
        <li><strong>Site Speed:</strong> Aim for under 3 seconds load time</li>
        <li><strong>Mobile-First:</strong> Ensure mobile responsiveness</li>
        <li><strong>SSL Certificate:</strong> Secure your site with HTTPS</li>
        <li><strong>XML Sitemap:</strong> Submit to Google Search Console</li>
        <li><strong>Robots.txt:</strong> Guide search engine crawlers</li>
      </ul>
    </div>

    <div class="resource-section">
      <h3>Content SEO</h3>
      <ul>
        <li><strong>Keyword Research:</strong> Use tools like Google Keyword Planner</li>
        <li><strong>Content Quality:</strong> Original, valuable, and comprehensive</li>
        <li><strong>Image Optimization:</strong> Compress images, use alt text</li>
        <li><strong>Regular Updates:</strong> Keep content fresh and current</li>
      </ul>
    </div>

    <div class="resource-section">
      <h3>Local SEO (for local businesses)</h3>
      <ul>
        <li><strong>Google Business Profile:</strong> Claim and optimize your listing</li>
        <li><strong>Local Keywords:</strong> Include location in keywords</li>
        <li><strong>NAP Consistency:</strong> Name, Address, Phone across all platforms</li>
        <li><strong>Local Citations:</strong> List in relevant directories</li>
        <li><strong>Customer Reviews:</strong> Encourage and respond to reviews</li>
      </ul>
    </div>
  `,
}

// Resource config with titles
const resources = {
  'website-checklist': {
    pdfFile: 'website-checklist.pdf',
    title: '10-Point Website Checklist',
  },
  'contact-form-templates': {
    pdfFile: 'contact-form-templates.pdf',
    title: '5 Contact Form Templates',
  },
  'seo-basics': {
    pdfFile: 'seo-basics-cheatsheet.pdf',
    title: 'SEO Basics Cheat Sheet',
  },
}

export async function POST(request: NextRequest) {
  let browser

  try {
    const body = await request.json()
    const { resourceId } = body

    if (!resourceId || !resources[resourceId as keyof typeof resources]) {
      return NextResponse.json(
        { error: 'Invalid resource ID' },
        { status: 400 },
      )
    }

    const resource = resources[resourceId as keyof typeof resources]
    const pdfPath = path.join(
      process.cwd(),
      'public',
      'resources',
      resource.pdfFile,
    )

    // Get pre-built HTML content
    const htmlContent = resourceContent[resourceId as keyof typeof resourceContent]

    // Create full HTML document
    const fullHtml = getHtmlTemplate(htmlContent, resource.title)

    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const page = await browser.newPage()

    // Set content and wait for it to load
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' })

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
      },
    })

    // Save PDF file
    await fs.writeFile(pdfPath, pdfBuffer)

    await browser.close()

    return NextResponse.json({
      success: true,
      message: `PDF generated successfully for ${resource.title}`,
      path: `/resources/${resource.pdfFile}`,
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    if (browser) {
      await browser.close()
    }
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 },
    )
  }
}

// GET request to generate all PDFs at once
export async function GET() {
  const results = []

  for (const [resourceId, resource] of Object.entries(resources)) {
    try {
      const response = await POST(
        new NextRequest(new URL('http://localhost:3000/api/generate-pdf'), {
          method: 'POST',
          body: JSON.stringify({ resourceId }),
        }),
      )

      const result = await response.json()
      results.push({ resourceId, ...result })
    } catch (error) {
      results.push({
        resourceId,
        success: false,
        error: (error as Error).message,
      })
    }
  }

  return NextResponse.json({ results })
}