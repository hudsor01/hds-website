// This test page has been replaced by the comprehensive test suite
// Use the following instead:
// - npm run test:cal - Full test suite with browser UI
// - npm run test:cal-diagnostics - Quick diagnostics
// - /public/test-cal-standalone.html - Manual browser testing

export default function TestCalendarPage() {
  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold text-white mb-8">
          ⚠️ Test Page Deprecated
        </h1>
        
        <div className="bg-gray-800 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4">
            This test page has been replaced
          </h2>
          <p className="text-gray-300 mb-6">
            Use the comprehensive test suite instead for better Cal.com integration testing.
          </p>
          
          <div className="space-y-4 text-left">
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="text-white font-medium mb-2">🧪 Comprehensive Test Suite</h3>
              <code className="text-cyan-400">npm run test:cal</code>
              <p className="text-gray-400 text-sm mt-1">Full Playwright test suite with browser UI</p>
            </div>
            
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="text-white font-medium mb-2">⚡ Quick Diagnostics</h3>
              <code className="text-cyan-400">npm run test:cal-diagnostics</code>
              <p className="text-gray-400 text-sm mt-1">Fast diagnostics without browser</p>
            </div>
            
            <div className="bg-gray-700 p-4 rounded">
              <h3 className="text-white font-medium mb-2">🌐 Manual Browser Testing</h3>
              <code className="text-cyan-400">/public/test-cal-standalone.html</code>
              <p className="text-gray-400 text-sm mt-1">Direct HTML test page</p>
            </div>
          </div>
        </div>
        
        <div className="text-gray-400">
          <p>
            For production calendar integration, visit{' '}
            <a href="/contact" className="text-cyan-400 hover:text-cyan-300 underline">
              /contact
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}