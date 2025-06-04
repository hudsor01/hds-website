import { inter, playfairDisplay, jetbrainsMono, fontClasses as _fontClasses } from '@/lib/fonts/font-config'

/**
 * Font Showcase Component
 * Demonstrates Next.js 15 font optimization and usage patterns
 */
export function FontShowcase() {
  return (
    <div className='max-w-4xl mx-auto p-8 space-y-12'>
      <div className='text-center'>
        <h1 className={`text-4xl font-bold mb-4 ${playfairDisplay.className}`}>
          Next.js 15 Font Optimization
        </h1>
        <p className={`text-lg text-gray-600 ${inter.className}`}>
          Demonstrating optimized font loading with automatic self-hosting
        </p>
      </div>

      {/* Inter Font Examples */}
      <section className='space-y-6'>
        <h2 className={`text-3xl font-bold text-gray-900 ${playfairDisplay.className}`}>
          Inter - Primary UI Font
        </h2>
        <div className={`space-y-4 ${inter.className}`}>
          <div>
            <h3 className='text-xl font-semibold mb-2'>Font Weights</h3>
            <div className='space-y-2'>
              <p className='font-normal'>Normal (400) - Regular body text for excellent readability</p>
              <p className='font-medium'>Medium (500) - Slightly bolder for emphasis and labels</p>
              <p className='font-semibold'>Semibold (600) - Strong emphasis and subheadings</p>
              <p className='font-bold'>Bold (700) - Headings and important call-to-actions</p>
            </div>
          </div>
          
          <div>
            <h3 className='text-xl font-semibold mb-2'>Text Sizes</h3>
            <div className='space-y-2'>
              <p className='text-xs'>Extra Small (12px) - Fine print and captions</p>
              <p className='text-sm'>Small (14px) - Secondary text and labels</p>
              <p className='text-base'>Base (16px) - Primary body text</p>
              <p className='text-lg'>Large (18px) - Lead paragraphs</p>
              <p className='text-xl'>Extra Large (20px) - Section introductions</p>
              <p className='text-2xl'>2XL (24px) - Minor headings</p>
            </div>
          </div>
        </div>
      </section>

      {/* Playfair Display Examples */}
      <section className='space-y-6'>
        <h2 className={`text-3xl font-bold text-gray-900 ${playfairDisplay.className}`}>
          Playfair Display - Elegant Headings
        </h2>
        <div className={`space-y-4 ${playfairDisplay.className}`}>
          <h1 className='text-5xl font-bold text-gray-900'>
            Hero Heading (48px)
          </h1>
          <h2 className='text-4xl font-semibold text-gray-800'>
            Page Title (36px)
          </h2>
          <h3 className='text-3xl font-medium text-gray-700'>
            Section Heading (30px)
          </h3>
          <h4 className='text-2xl font-normal text-gray-600'>
            Subsection (24px)
          </h4>
          <p className='text-lg font-normal italic text-gray-600'>
            Perfect for elegant quotes and emphasis text
          </p>
        </div>
      </section>

      {/* JetBrains Mono Examples */}
      <section className='space-y-6'>
        <h2 className={`text-3xl font-bold text-gray-900 ${playfairDisplay.className}`}>
          JetBrains Mono - Technical Content
        </h2>
        <div className={`space-y-4 ${jetbrainsMono.className}`}>
          <div>
            <h3 className={`text-xl font-semibold mb-2 ${inter.className}`}>Code Examples</h3>
            <pre className='bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto'>
{`// Next.js Font Configuration
import { Inter, Playfair_Display } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export default function Layout({ children }) {
  return (
    <html className={inter.variable}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}`}
            </pre>
          </div>
          
          <div>
            <h3 className={`text-xl font-semibold mb-2 ${inter.className}`}>Inline Code</h3>
            <p className={inter.className}>
              Use <code className='bg-gray-100 px-2 py-1 rounded text-sm'>font-display: swap</code> for 
              optimal loading performance and <code className='bg-gray-100 px-2 py-1 rounded text-sm'>preload: true</code> for 
              critical fonts.
            </p>
          </div>
        </div>
      </section>

      {/* Performance Features */}
      <section className='space-y-6'>
        <h2 className={`text-3xl font-bold text-gray-900 ${playfairDisplay.className}`}>
          Performance Features
        </h2>
        <div className={`space-y-6 ${inter.className}`}>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='bg-blue-50 p-6 rounded-lg'>
              <h3 className='text-lg font-semibold text-blue-800 mb-3'>Automatic Self-Hosting</h3>
              <ul className='text-blue-700 space-y-2 text-sm'>
                <li>• No external requests to Google Fonts</li>
                <li>• Fonts served from your domain</li>
                <li>• Better privacy and performance</li>
                <li>• GDPR compliant by default</li>
              </ul>
            </div>
            
            <div className='bg-green-50 p-6 rounded-lg'>
              <h3 className='text-lg font-semibold text-green-800 mb-3'>Optimized Loading</h3>
              <ul className='text-green-700 space-y-2 text-sm'>
                <li>• font-display: swap for better UX</li>
                <li>• Preload critical fonts</li>
                <li>• Variable fonts for flexibility</li>
                <li>• Subset optimization</li>
              </ul>
            </div>
            
            <div className='bg-purple-50 p-6 rounded-lg'>
              <h3 className='text-lg font-semibold text-purple-800 mb-3'>Build-Time Optimization</h3>
              <ul className='text-purple-700 space-y-2 text-sm'>
                <li>• Fonts downloaded at build time</li>
                <li>• CSS variables for easy theming</li>
                <li>• Automatic fallback generation</li>
                <li>• Zero layout shift</li>
              </ul>
            </div>
            
            <div className='bg-orange-50 p-6 rounded-lg'>
              <h3 className='text-lg font-semibold text-orange-800 mb-3'>Developer Experience</h3>
              <ul className='text-orange-700 space-y-2 text-sm'>
                <li>• Type-safe font configuration</li>
                <li>• CSS variables for easy usage</li>
                <li>• Tailwind CSS integration</li>
                <li>• Hot reload support</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Usage Guidelines */}
      <section className='space-y-6'>
        <h2 className={`text-3xl font-bold text-gray-900 ${playfairDisplay.className}`}>
          Usage Guidelines
        </h2>
        <div className={`space-y-4 ${inter.className}`}>
          <div className='bg-gray-50 p-6 rounded-lg'>
            <h3 className='text-lg font-semibold mb-3'>Best Practices</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
              <div>
                <h4 className='font-semibold text-gray-800 mb-2'>Font Selection</h4>
                <ul className='space-y-1 text-gray-600'>
                  <li>• Use Inter for UI and body text</li>
                  <li>• Use Playfair for headings and quotes</li>
                  <li>• Use JetBrains Mono for code</li>
                  <li>• Limit to 2-3 font families max</li>
                </ul>
              </div>
              <div>
                <h4 className='font-semibold text-gray-800 mb-2'>Performance Tips</h4>
                <ul className='space-y-1 text-gray-600'>
                  <li>• Preload only critical fonts</li>
                  <li>• Use font-display: swap</li>
                  <li>• Specify appropriate subsets</li>
                  <li>• Consider variable fonts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Implementation */}
      <section className='space-y-6'>
        <h2 className={`text-3xl font-bold text-gray-900 ${playfairDisplay.className}`}>
          Technical Implementation
        </h2>
        <div className={`${inter.className}`}>
          <div className='bg-gray-50 p-6 rounded-lg'>
            <h3 className='text-lg font-semibold mb-4'>File Structure</h3>
            <div className={`text-sm space-y-1 ${jetbrainsMono.className}`}>
              <div className='text-gray-600'>lib/fonts/</div>
              <div className='text-gray-600 ml-4'>├── font-config.ts</div>
              <div className='text-gray-600 ml-4'>└── index.ts</div>
              <div className='text-gray-600'>app/</div>
              <div className='text-gray-600 ml-4'>├── layout.tsx</div>
              <div className='text-gray-600 ml-4'>└── globals.css</div>
              <div className='text-gray-600'>public/fonts/</div>
              <div className='text-gray-600 ml-4'>└── custom-fonts.woff2</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}