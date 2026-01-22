/**
 * Stirling PDF Client
 * Handles communication with self-hosted Stirling PDF instance
 */

import { logger } from '@/lib/logger';
import { castError } from '@/lib/utils/errors';

const STIRLING_PDF_URL = process.env.STIRLING_PDF_URL;

if (!STIRLING_PDF_URL) {
  throw new Error('STIRLING_PDF_URL environment variable is not set');
}

export interface GeneratePDFOptions {
  html: string;
  filename: string;
}

/**
 * Generate PDF from HTML using Stirling PDF API
 * @param options - HTML content and desired filename
 * @returns PDF file as Buffer
 */
export async function generatePDFFromHTML(
  options: GeneratePDFOptions
): Promise<Buffer> {
  const { html, filename } = options;

  try {
    // Stirling PDF expects multipart/form-data with HTML file
    const formData = new FormData();
    const htmlBlob = new Blob([html], { type: 'text/html' });
    formData.append('fileInput', htmlBlob, `${filename}.html`);

    const response = await fetch(
      `${STIRLING_PDF_URL}/api/v1/convert/html/pdf`,
      {
        method: 'POST',
        body: formData,
        headers: {
          // Let browser set Content-Type with boundary for multipart/form-data
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Stirling PDF API error: ${response.status} - ${errorText}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    const err = castError(error);
    logger.error('Failed to generate PDF from HTML', {
      filename,
      error: err.message,
      stirlingUrl: STIRLING_PDF_URL,
    });
    throw err;
  }
}

/**
 * Check if Stirling PDF service is available
 */
export async function checkStirlingPDFHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${STIRLING_PDF_URL}/api/v1/info/status`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    logger.error('Stirling PDF health check failed', castError(error));
    return false;
  }
}
