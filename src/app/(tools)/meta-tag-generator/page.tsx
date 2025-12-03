/**
 * Meta Tag Generator
 * Generate SEO-optimized meta tags, Open Graph, and Twitter Card markup
 */

'use client';

import { useState } from 'react';
import { CalculatorLayout } from '@/components/calculators/CalculatorLayout';
import { CalculatorInput } from '@/components/calculators/CalculatorInput';
import { trackEvent } from '@/lib/analytics';
import { Copy, Check, Eye, Code } from 'lucide-react';
import { logger } from '@/lib/logger';

interface MetaInputs {
  pageTitle: string;
  pageDescription: string;
  keywords: string;
  pageUrl: string;
  imageUrl: string;
  siteName: string;
  twitterHandle: string;
  author: string;
}

export default function MetaTagGeneratorPage() {
  const [inputs, setInputs] = useState<MetaInputs>({
    pageTitle: '',
    pageDescription: '',
    keywords: '',
    pageUrl: '',
    imageUrl: '',
    siteName: '',
    twitterHandle: '',
    author: '',
  });

  const [showResults, setShowResults] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');

  const handleInputChange = (field: keyof MetaInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const generateMetaTags = () => {
    setShowResults(true);

    trackEvent('calculator_used', {
      calculator_type: 'meta-tag-generator',
      has_og_image: !!inputs.imageUrl,
      has_twitter: !!inputs.twitterHandle,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateMetaTags();
  };

  const generatedCode = `<!-- Primary Meta Tags -->
<title>${inputs.pageTitle}</title>
<meta name="title" content="${inputs.pageTitle}" />
<meta name="description" content="${inputs.pageDescription}" />${inputs.keywords ? `
<meta name="keywords" content="${inputs.keywords}" />` : ''}${inputs.author ? `
<meta name="author" content="${inputs.author}" />` : ''}

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${inputs.pageUrl}" />
<meta property="og:title" content="${inputs.pageTitle}" />
<meta property="og:description" content="${inputs.pageDescription}" />${inputs.imageUrl ? `
<meta property="og:image" content="${inputs.imageUrl}" />` : ''}${inputs.siteName ? `
<meta property="og:site_name" content="${inputs.siteName}" />` : ''}

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content="${inputs.pageUrl}" />
<meta property="twitter:title" content="${inputs.pageTitle}" />
<meta property="twitter:description" content="${inputs.pageDescription}" />${inputs.imageUrl ? `
<meta property="twitter:image" content="${inputs.imageUrl}" />` : ''}${inputs.twitterHandle ? `
<meta property="twitter:creator" content="${inputs.twitterHandle}" />` : ''}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for browsers without clipboard API
      logger.debug('Clipboard API unavailable, using fallback', {
        error: error instanceof Error ? error.message : String(error),
      });
      const textArea = document.createElement('textarea');
      textArea.value = generatedCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const titleLength = inputs.pageTitle.length;
  const descriptionLength = inputs.pageDescription.length;
  const titleOptimal = titleLength >= 50 && titleLength <= 60;
  const descriptionOptimal = descriptionLength >= 150 && descriptionLength <= 160;

  return (
    <CalculatorLayout
      title="Meta Tag Generator"
      description="Generate SEO-optimized meta tags, Open Graph, and Twitter Card markup for your website"
      icon={
        <Code className="h-8 w-8 text-cyan-600" />
      }
    >
      {!showResults ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Required Fields */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Required Information
            </h3>

            <div>
              <CalculatorInput
                label="Page Title"
                id="pageTitle"
                type="text"
                value={inputs.pageTitle}
                onChange={(e) => handleInputChange('pageTitle', e.target.value)}
                helpText={`${titleLength}/60 characters ${titleOptimal ? '(optimal)' : titleLength > 60 ? '(too long)' : '(add more)'}`}
                required
                maxLength={70}
              />
              <div className="mt-1 h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full transition-all ${titleOptimal ? 'bg-green-500' : titleLength > 60 ? 'bg-red-500' : 'bg-yellow-500'}`}
                  style={{ width: `${Math.min((titleLength / 60) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Page Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={inputs.pageDescription}
                onChange={(e) => handleInputChange('pageDescription', e.target.value)}
                className="w-full rounded-md border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                rows={3}
                required
                maxLength={170}
                placeholder="A compelling description of your page (150-160 characters)"
              />
              <div className="flex justify-between items-center mt-1">
                <span className={`text-xs ${descriptionOptimal ? 'text-green-600' : descriptionLength > 160 ? 'text-red-600' : 'text-yellow-600'}`}>
                  {descriptionLength}/160 characters {descriptionOptimal ? '(optimal)' : descriptionLength > 160 ? '(too long)' : '(add more)'}
                </span>
              </div>
              <div className="mt-1 h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full transition-all ${descriptionOptimal ? 'bg-green-500' : descriptionLength > 160 ? 'bg-red-500' : 'bg-yellow-500'}`}
                  style={{ width: `${Math.min((descriptionLength / 160) * 100, 100)}%` }}
                />
              </div>
            </div>

            <CalculatorInput
              label="Page URL"
              id="pageUrl"
              type="url"
              value={inputs.pageUrl}
              onChange={(e) => handleInputChange('pageUrl', e.target.value)}
              helpText="Full URL including https://"
              required
              placeholder="https://example.com/page"
            />
          </div>

          {/* Optional Fields */}
          <div className="space-y-4 border-t border-border pt-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Optional Information
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <CalculatorInput
                label="Keywords"
                id="keywords"
                type="text"
                value={inputs.keywords}
                onChange={(e) => handleInputChange('keywords', e.target.value)}
                helpText="Comma-separated keywords"
                placeholder="seo, marketing, web design"
              />

              <CalculatorInput
                label="Site Name"
                id="siteName"
                type="text"
                value={inputs.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                helpText="Your website or brand name"
                placeholder="Hudson Digital Solutions"
              />

              <CalculatorInput
                label="Image URL"
                id="imageUrl"
                type="url"
                value={inputs.imageUrl}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                helpText="1200x630px recommended for social"
                placeholder="https://example.com/og-image.jpg"
              />

              <CalculatorInput
                label="Twitter Handle"
                id="twitterHandle"
                type="text"
                value={inputs.twitterHandle}
                onChange={(e) => handleInputChange('twitterHandle', e.target.value)}
                helpText="Include the @ symbol"
                placeholder="@username"
              />

              <CalculatorInput
                label="Author"
                id="author"
                type="text"
                value={inputs.author}
                onChange={(e) => handleInputChange('author', e.target.value)}
                helpText="Content author name"
                placeholder="John Doe"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-cyan-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            Generate Meta Tags
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'code'
                  ? 'border-cyan-500 text-cyan-600'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Code className="w-4 h-4" />
              HTML Code
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'preview'
                  ? 'border-cyan-500 text-cyan-600'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>

          {activeTab === 'code' ? (
            <div className="relative">
              <button
                onClick={copyToClipboard}
                className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy Code
                  </>
                )}
              </button>
              <pre className="rounded-lg bg-gray-900 p-4 pt-12 overflow-x-auto">
                <code className="text-sm text-gray-100 whitespace-pre-wrap break-all">
                  {generatedCode}
                </code>
              </pre>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Google Preview */}
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">Google Search Preview</h4>
                <div className="rounded-lg border border-border p-4 bg-white dark:bg-gray-800">
                  <div className="text-blue-600 text-lg hover:underline cursor-pointer truncate">
                    {inputs.pageTitle || 'Page Title'}
                  </div>
                  <div className="text-green-700 text-sm truncate">
                    {inputs.pageUrl || 'https://example.com'}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                    {inputs.pageDescription || 'Page description will appear here...'}
                  </div>
                </div>
              </div>

              {/* Social Preview */}
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">Social Media Preview</h4>
                <div className="rounded-lg border border-border overflow-hidden max-w-md">
                  {inputs.imageUrl ? (
                    <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">Image: {inputs.imageUrl}</span>
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                      <span className="text-white text-lg font-bold">{inputs.siteName || inputs.pageTitle || 'Your Site'}</span>
                    </div>
                  )}
                  <div className="p-4 bg-white dark:bg-gray-800">
                    <div className="text-xs text-muted-foreground uppercase mb-1">
                      {inputs.siteName || new URL(inputs.pageUrl || 'https://example.com').hostname}
                    </div>
                    <div className="font-semibold text-foreground truncate">
                      {inputs.pageTitle || 'Page Title'}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {inputs.pageDescription || 'Page description...'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => setShowResults(false)}
            className="w-full rounded-md border border-border bg-white px-6 py-3 text-base font-semibold text-muted-foreground shadow-sm hover:bg-muted dark:border-gray-600 dark:bg-muted dark:hover:bg-gray-600"
          >
            ← Edit Information
          </button>
        </div>
      )}

      {/* Educational Content */}
      <div className="mt-8 space-y-4 border-t pt-8 dark:border-border">
        <h3 className="text-lg font-semibold text-foreground dark:text-white">
          Meta Tag Best Practices
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-4 dark:border-border">
            <h4 className="mb-2 font-semibold text-foreground dark:text-white">
              Title Tag
            </h4>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Keep between 50-60 characters. Include your primary keyword near the beginning.
            </p>
          </div>

          <div className="rounded-lg border border-border p-4 dark:border-border">
            <h4 className="mb-2 font-semibold text-foreground dark:text-white">
              Meta Description
            </h4>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Aim for 150-160 characters. Include a call-to-action and your target keyword.
            </p>
          </div>

          <div className="rounded-lg border border-border p-4 dark:border-border">
            <h4 className="mb-2 font-semibold text-foreground dark:text-white">
              Open Graph Images
            </h4>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Use 1200x630px images for optimal display on Facebook and LinkedIn.
            </p>
          </div>

          <div className="rounded-lg border border-border p-4 dark:border-border">
            <h4 className="mb-2 font-semibold text-foreground dark:text-white">
              Twitter Cards
            </h4>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              summary_large_image provides the most visual impact for content sharing.
            </p>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
