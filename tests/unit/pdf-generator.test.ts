 
import { describe, it, expect, mock, beforeEach } from 'bun:test';

// Mock server-only before importing the module
mock.module('server-only', () => ({}));

// Mock puppeteer
const mockPage = {
  setContent: mock(() => Promise.resolve(undefined)),
  pdf: mock(() => Promise.resolve(Buffer.from('pdf content'))),
};

const mockBrowser = {
  newPage: mock(() => Promise.resolve(mockPage)),
  close: mock(() => Promise.resolve(undefined)),
};

mock.module('puppeteer', () => ({
  default: {
    launch: mock(() => Promise.resolve(mockBrowser)),
  },
}));

mock.module('@/lib/logger', () => ({
  logger: {
    error: mock(),
    warn: mock(),
    info: mock(),
  },
}));

describe('PDF Generator (Server-side)', () => {
  beforeEach(() => {
    mock.restore();
    mockPage.setContent.mockClear();
    mockPage.pdf.mockClear();
    mockBrowser.newPage.mockClear();
    mockBrowser.close.mockClear();
  });

  describe('generateFromHtml', () => {
    it('should generate PDF from HTML successfully', async () => {
      const { PDFGenerator } = await import('@/lib/pdf/generator');

      const html = '<html><body>Test Content</body></html>';
      const result = await PDFGenerator.generateFromHtml(html);

      expect(result).toBeInstanceOf(Buffer);
      expect(mockBrowser.newPage).toHaveBeenCalled();
      expect(mockPage.setContent).toHaveBeenCalledWith(html, { waitUntil: 'networkidle0' });
      expect(mockBrowser.close).toHaveBeenCalled();
    });

    it('should use custom options when provided', async () => {
      const { PDFGenerator } = await import('@/lib/pdf/generator');

      const html = '<html><body>Test</body></html>';
      await PDFGenerator.generateFromHtml(html, {
        format: 'Letter',
        landscape: true,
        margin: { top: '1in', right: '1in', bottom: '1in', left: '1in' }
      });

      expect(mockPage.pdf).toHaveBeenCalledWith(expect.objectContaining({
        format: 'Letter',
        landscape: true,
        margin: { top: '1in', right: '1in', bottom: '1in', left: '1in' }
      }));
    });

    it('should use default options when none provided', async () => {
      const { PDFGenerator } = await import('@/lib/pdf/generator');

      const html = '<html><body>Test</body></html>';
      await PDFGenerator.generateFromHtml(html);

      expect(mockPage.pdf).toHaveBeenCalledWith(expect.objectContaining({
        format: 'A4',
        landscape: false,
        printBackground: true,
      }));
    });

    it('should close browser on error', async () => {
      const { PDFGenerator } = await import('@/lib/pdf/generator');

      mockPage.setContent.mockImplementation(() => Promise.reject(new Error('Content error')));

      const html = '<html><body>Test</body></html>';
      await expect(PDFGenerator.generateFromHtml(html)).rejects.toThrow();
      expect(mockBrowser.close).toHaveBeenCalled();
    });
  });
});
