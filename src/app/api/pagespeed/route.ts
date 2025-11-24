/**
 * PageSpeed Insights API Proxy
 * Fetches performance metrics for a given URL
 */

import { type NextRequest, NextResponse } from 'next/server';
import { createServerLogger } from '@/lib/logger';

const logger = createServerLogger('pagespeed-api');
const PAGESPEED_API_URL = 'https://www.googleapis.com/pagespeedinsights/v5/runPagespeed';

interface PageSpeedResponse {
  lighthouseResult: {
    categories: {
      performance: {
        score: number;
      };
    };
    audits: {
      'first-contentful-paint': { displayValue: string; score: number };
      'largest-contentful-paint': { displayValue: string; score: number };
      'total-blocking-time': { displayValue: string; score: number };
      'cumulative-layout-shift': { displayValue: string; score: number };
      'speed-index': { displayValue: string; score: number };
    };
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    logger.info('Fetching PageSpeed data', { url });

    // Call PageSpeed Insights API
    const response = await fetch(
      `${PAGESPEED_API_URL}?url=${encodeURIComponent(url)}&strategy=mobile&category=performance`,
      {
        headers: {
          'User-Agent': 'Hudson Digital Solutions Website Analyzer',
        },
      }
    );

    if (!response.ok) {
      logger.error('PageSpeed API error', new Error(`Status: ${response.status}`));
      return NextResponse.json(
        { error: 'Failed to fetch performance data' },
        { status: response.status }
      );
    }

    const data = await response.json() as PageSpeedResponse;

    // Extract key metrics
    const performanceScore = Math.round((data.lighthouseResult.categories.performance.score || 0) * 100);
    const audits = data.lighthouseResult.audits;

    const metrics = {
      performanceScore,
      fcp: audits['first-contentful-paint']?.displayValue || 'N/A',
      lcp: audits['largest-contentful-paint']?.displayValue || 'N/A',
      tbt: audits['total-blocking-time']?.displayValue || 'N/A',
      cls: audits['cumulative-layout-shift']?.displayValue || 'N/A',
      speedIndex: audits['speed-index']?.displayValue || 'N/A',
      fcpScore: Math.round((audits['first-contentful-paint']?.score || 0) * 100),
      lcpScore: Math.round((audits['largest-contentful-paint']?.score || 0) * 100),
      tbtScore: Math.round((audits['total-blocking-time']?.score || 0) * 100),
      clsScore: Math.round((audits['cumulative-layout-shift']?.score || 0) * 100),
    };

    logger.info('PageSpeed data fetched successfully', { url, performanceScore });

    return NextResponse.json({ success: true, metrics });
  } catch (error) {
    logger.error('PageSpeed API error', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to analyze website performance' },
      { status: 500 }
    );
  }
}
