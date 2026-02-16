/**
 * Meta Tag Generator
 * Generate SEO-optimized meta tags, Open Graph, and Twitter Card markup
 */

import type { Metadata } from 'next';
import MetaTagGeneratorClient from './MetaTagGeneratorClient';

export const metadata: Metadata = {
  title: 'Meta Tag Generator | Hudson Digital Solutions',
  description:
    'Generate SEO-optimized meta tags, Open Graph, and Twitter Card markup for your web pages. Free meta tag generator with live preview.',
  openGraph: {
    title: 'Meta Tag Generator',
    description:
      'Generate SEO-optimized meta tags, Open Graph, and Twitter Card markup.',
  },
};

export default function MetaTagGeneratorPage() {
  return <MetaTagGeneratorClient />;
}
