/**
 * PDF Generator - Server-side only
 * =============================================================================
 *
 * This module provides server-side PDF generation using Puppeteer.
 * For client-side PDF generation, use @react-pdf/renderer directly.
 *
 * IMPORTANT: This file should ONLY be imported in:
 * - API routes
 * - Server Components
 * - Server Actions
 *
 * Do NOT import this in Client Components - use client-pdf.ts instead.
 */

import 'server-only';

import puppeteer from 'puppeteer';
import { logger } from '@/lib/logger';

export interface PDFGenerationOptions {
  format?: 'A4' | 'Letter';
  landscape?: boolean;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
}

/**
 * Server-side PDF generation using Puppeteer
 * Use this for generating PDFs from HTML in API routes
 */
export class PDFGenerator {
  /**
   * Generate PDF from HTML using Puppeteer
   * This runs on the server only
   */
  static async generateFromHtml(
    html: string,
    options: PDFGenerationOptions = {}
  ): Promise<Buffer> {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const buffer = await page.pdf({
        format: options.format || 'A4',
        landscape: options.landscape || false,
        printBackground: true,
        margin: options.margin || {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        }
      });

      return Buffer.from(buffer);
    } catch (error) {
      logger.error('Failed to generate PDF with Puppeteer:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}
