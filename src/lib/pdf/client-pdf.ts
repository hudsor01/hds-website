/**
 * Client-side PDF Generator
 * =============================================================================
 *
 * This module provides client-side PDF generation using @react-pdf/renderer.
 * Safe to import in Client Components.
 *
 * For server-side PDF generation (from HTML), use generator.ts instead.
 */

import { pdf, type DocumentProps } from '@react-pdf/renderer';
import { logger } from '@/lib/logger';

/**
 * Generate PDF buffer from a React PDF document
 * This runs in the browser using @react-pdf/renderer
 */
export async function generatePDFFromDocument(
  document: React.ReactElement<DocumentProps>
): Promise<Blob> {
  try {
    const blob = await pdf(document).toBlob();
    return blob;
  } catch (error) {
    logger.error('Failed to generate PDF:', error);
    throw error;
  }
}

/**
 * Generate and download PDF from a React PDF document
 */
export async function downloadPDF(
  document: React.ReactElement<DocumentProps>,
  filename: string
): Promise<void> {
  try {
    const blob = await generatePDFFromDocument(document);
    const url = URL.createObjectURL(blob);

    const link = window.document.createElement('a');
    link.href = url;
    link.download = filename;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    logger.error('Failed to download PDF:', error);
    throw error;
  }
}
