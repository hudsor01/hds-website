// Email templates for Hudson Digital Solutions

export interface ContactFormData {
  name: string
  email: string
  company?: string
  phone?: string
  message: string
}

export interface NewsletterSignupData {
  email: string
  firstName?: string
  lastName?: string
}

export interface LeadMagnetData {
  email: string
  firstName?: string
  lastName?: string
  resourceName: string
  downloadLink: string
}

/**
 * Generates HTML email template for contact form submissions
 */
export function contactFormTemplate(data: ContactFormData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset='utf-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>New Contact Form Submission</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          h1 { color: #2563eb; }
          .info-label { font-weight: bold; }
          .message-box { background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin-top: 20px; }
          .footer { margin-top: 30px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 10px; }
        </style>
      </head>
      <body>
        <h1>New Contact Form Submission</h1>
        <p>You've received a new inquiry from the Hudson Digital Solutions website.</p>
        
        <p><span class='info-label'>Name:</span> ${data.name}</p>
        <p><span class='info-label'>Email:</span> ${data.email}</p>
        ${data.company ? `<p><span class='info-label'>Company:</span> ${data.company}</p>` : ''}
        ${data.phone ? `<p><span class='info-label'>Phone:</span> ${data.phone}</p>` : ''}
        
        <div class='message-box'>
          <p class='info-label'>Message:</p>
          <p>${data.message.replace(/\\n/g, '<br>')}</p>
        </div>
        
        <div class='footer'>
          <p>This email was sent from the contact form on hudsondigitalsolutions.com</p>
        </div>
      </body>
    </html>
  `
}

/**
 * Generates text-only email template for contact form submissions
 */
export function contactFormTextTemplate(data: ContactFormData): string {
  return `
New Contact Form Submission

You've received a new inquiry from the Hudson Digital Solutions website.

Name: ${data.name}
Email: ${data.email}
${data.company ? `Company: ${data.company}` : ''}
${data.phone ? `Phone: ${data.phone}` : ''}

Message:
${data.message}

This email was sent from the contact form on hudsondigitalsolutions.com
  `.trim()
}

/**
 * Generates HTML template for newsletter welcome email
 */
export function newsletterWelcomeTemplate(data: NewsletterSignupData): string {
  const greeting = data.firstName ? `Hi ${data.firstName},` : 'Hello,'

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset='utf-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>Welcome to the Hudson Digital Solutions Newsletter</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          h1 { color: #2563eb; }
          .button { display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
          .footer { margin-top: 30px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 10px; }
        </style>
      </head>
      <body>
        <h1>Welcome to Our Newsletter!</h1>
        <p>${greeting}</p>
        <p>Thank you for subscribing to the Hudson Digital Solutions newsletter. We're excited to share our latest insights, industry trends, and digital transformation strategies with you.</p>
        
        <p>Here's what you can expect:</p>
        <ul>
          <li>Monthly updates on emerging technologies</li>
          <li>Expert tips for optimizing your digital business</li>
          <li>Case studies and success stories</li>
          <li>Exclusive offers and resources</li>
        </ul>
        
        <p>If you have any questions or topics you'd like us to cover, feel free to reply to this email.</p>
        
        <a href='https://hudsondigitalsolutions.com/resources' class='button'>Explore Our Resources</a>
        
        <div class='footer'>
          <p>© ${new Date().getFullYear()} Hudson Digital Solutions. All rights reserved.</p>
          <p>You're receiving this email because you signed up for our newsletter. <a href='https://hudsondigitalsolutions.com/unsubscribe?email=${encodeURIComponent(data.email)}'>Unsubscribe</a></p>
        </div>
      </body>
    </html>
  `
}

/**
 * Generates HTML template for lead magnet delivery emails
 */
export function leadMagnetTemplate(data: LeadMagnetData): string {
  const greeting = data.firstName ? `Hi ${data.firstName},` : 'Hello,'

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset='utf-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>Your Requested Resource from Hudson Digital Solutions</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          h1 { color: #2563eb; }
          .button { display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
          .download-section { background-color: #f3f4f6; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; }
          .footer { margin-top: 30px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 10px; }
        </style>
      </head>
      <body>
        <h1>Your ${data.resourceName} is Ready!</h1>
        <p>${greeting}</p>
        <p>Thank you for your interest in our resources. Here's your copy of <strong>${data.resourceName}</strong> that you requested.</p>
        
        <div class='download-section'>
          <p>Click the button below to access your resource:</p>
          <a href='${data.downloadLink}' class='button'>Download Now</a>
        </div>
        
        <p>We hope you find this resource valuable. If you have any questions or need further assistance, don't hesitate to contact our team.</p>
        
        <p>Want to learn more about how we can help your business thrive in the digital landscape?</p>
        <a href='https://hudsondigitalsolutions.com/contact' class='button'>Contact Us</a>
        
        <div class='footer'>
          <p>© ${new Date().getFullYear()} Hudson Digital Solutions. All rights reserved.</p>
          <p>You're receiving this email because you requested a resource from our website. <a href='https://hudsondigitalsolutions.com/unsubscribe?email=${encodeURIComponent(data.email)}'>Unsubscribe</a></p>
        </div>
      </body>
    </html>
  `
}
