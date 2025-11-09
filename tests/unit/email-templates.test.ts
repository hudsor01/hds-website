import { describe, it, expect } from 'vitest';
import {
  generateContactFormNotification,
  generateLeadMagnetNotification,
  generateLeadMagnetWelcomeEmail,
} from '@/lib/email-templates';

describe('Email Templates', () => {
  describe('generateContactFormNotification', () => {
    it('should generate admin notification with all contact details', () => {
      const html = generateContactFormNotification({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-1234',
        company: 'Acme Corp',
        service: 'Web Development',
        budget: '$10k-$25k',
        timeline: '1-3 months',
        message: 'Need a new website',
        leadScore: 85,
        sequenceId: 'high-intent',
      });

      expect(html).toContain('New Contact Form Submission');
      expect(html).toContain('John Doe');
      expect(html).toContain('john@example.com');
      expect(html).toContain('555-1234');
      expect(html).toContain('Acme Corp');
      expect(html).toContain('Web Development');
      expect(html).toContain('$10k-$25k');
      expect(html).toContain('1-3 months');
      expect(html).toContain('Need a new website');
      expect(html).toContain('85/100');
      expect(html).toContain('HIGH PRIORITY');
    });

    it('should handle optional fields gracefully', () => {
      const html = generateContactFormNotification({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        message: 'Just a question',
      });

      expect(html).toContain('Jane Smith');
      expect(html).toContain('jane@example.com');
      expect(html).toContain('Just a question');
      // Should not contain optional fields
      expect(html).not.toMatch(/Phone.*555/);
      expect(html).not.toMatch(/Company.*Acme/);
    });

    it('should show correct priority badges based on lead score', () => {
      const highPriority = generateContactFormNotification({
        firstName: 'High',
        lastName: 'Score',
        email: 'high@example.com',
        message: 'Test',
        leadScore: 75,
      });
      expect(highPriority).toContain('HIGH PRIORITY');
      expect(highPriority).toContain('Schedule call within 24 hours');

      const qualified = generateContactFormNotification({
        firstName: 'Med',
        lastName: 'Score',
        email: 'med@example.com',
        message: 'Test',
        leadScore: 50,
      });
      expect(qualified).toContain('QUALIFIED');
      expect(qualified).toContain('Follow up within 2-3 days');

      const nurture = generateContactFormNotification({
        firstName: 'Low',
        lastName: 'Score',
        email: 'low@example.com',
        message: 'Test',
        leadScore: 30,
      });
      expect(nurture).toContain('NURTURE');
      expect(nurture).toContain('Add to nurture sequence');
    });

    it('should handle special characters in input', () => {
      const html = generateContactFormNotification({
        firstName: 'Test & User',
        lastName: 'O\'Brien',
        email: 'test@example.com',
        message: 'I need "help" with my website',
      });

      // Should contain the user's data
      expect(html).toContain('test@example.com');
      expect(html).toBeTruthy();
      expect(html).toContain('Contact Information');
    });
  });

  describe('generateLeadMagnetNotification', () => {
    it('should generate admin notification for lead magnet downloads', () => {
      const html = generateLeadMagnetNotification({
        firstName: 'Alex',
        email: 'alex@example.com',
        resourceTitle: 'Website Performance Checklist',
      });

      expect(html).toContain('New Lead Magnet Download');
      expect(html).toContain('Alex');
      expect(html).toContain('alex@example.com');
      expect(html).toContain('Website Performance Checklist');
      expect(html).toContain('Follow-up Actions');
    });

    it('should include follow-up recommendations', () => {
      const html = generateLeadMagnetNotification({
        firstName: 'Sam',
        email: 'sam@example.com',
        resourceTitle: 'ROI Calculator',
      });

      expect(html).toContain('Add to CRM/email marketing system');
      expect(html).toContain('Tag as "ROI Calculator" lead');
      expect(html).toContain('Schedule follow-up email sequence');
      expect(html).toContain('strategic consultation');
    });

    it('should handle special characters in lead data', () => {
      const html = generateLeadMagnetNotification({
        firstName: 'Test & Co',
        email: 'test@example.com',
        resourceTitle: 'ROI Calculator 2024',
      });

      // Should contain the data
      expect(html).toContain('test@example.com');
      expect(html).toContain('ROI Calculator 2024');
      expect(html).toContain('Lead Information');
    });
  });

  describe('generateLeadMagnetWelcomeEmail', () => {
    it('should generate welcome email with download link', () => {
      const html = generateLeadMagnetWelcomeEmail({
        firstName: 'Taylor',
        resourceTitle: 'Conversion Guide',
        downloadUrl: 'https://example.com/download/guide.pdf',
      });

      expect(html).toContain('Thanks for downloading Conversion Guide!');
      expect(html).toContain('Hi Taylor');
      expect(html).toContain('https://example.com/download/guide.pdf');
      expect(html).toContain('Download Now');
    });

    it('should include CTA for consultation', () => {
      const html = generateLeadMagnetWelcomeEmail({
        firstName: 'Morgan',
        resourceTitle: 'Test Resource',
        downloadUrl: 'https://example.com/test.pdf',
      });

      expect(html).toContain('Need Help Implementing?');
      expect(html).toContain('Schedule a Consultation');
      expect(html).toContain('hudsondigitalsolutions.com/contact');
    });

    it('should have proper email structure and styling', () => {
      const html = generateLeadMagnetWelcomeEmail({
        firstName: 'Test',
        resourceTitle: 'Resource',
        downloadUrl: 'https://example.com/file.pdf',
      });

      // Should have email wrapper
      expect(html).toContain('font-family: Arial, sans-serif');
      expect(html).toContain('max-width: 600px');
      // Should have CTA buttons
      expect(html).toContain('background: #0891b2');
      expect(html).toContain('Download Now');
    });

    it('should handle apostrophes and special characters in welcome email', () => {
      const html = generateLeadMagnetWelcomeEmail({
        firstName: "O'Brien",
        resourceTitle: 'Guide & Tips 2024',
        downloadUrl: 'https://example.com/guide.pdf',
      });

      // Should contain the data
      expect(html).toContain('https://example.com/guide.pdf');
      expect(html).toContain('Download Now');
      expect(html).toContain('Schedule a Consultation');
    });
  });

  describe('Edge cases and validation', () => {
    it('should handle empty strings gracefully', () => {
      const html = generateContactFormNotification({
        firstName: '',
        lastName: '',
        email: 'test@example.com',
        message: '',
      });

      expect(html).toBeTruthy();
      expect(html).toContain('test@example.com');
    });

    it('should handle very long messages', () => {
      const longMessage = 'A'.repeat(5000);
      const html = generateContactFormNotification({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        message: longMessage,
      });

      expect(html).toContain(longMessage);
    });

    it('should generate consistent timestamp format', () => {
      const html1 = generateContactFormNotification({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        message: 'Test',
      });

      const html2 = generateLeadMagnetNotification({
        firstName: 'Test',
        email: 'test@example.com',
        resourceTitle: 'Test',
      });

      // Both should have "Submitted:" timestamp
      expect(html1).toMatch(/Submitted:.*20\d{2}/);
      expect(html2).toMatch(/Submitted:.*20\d{2}/);
    });
  });
});
