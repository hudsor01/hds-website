'use client'

import type { ReactNode } from 'react'

// ====== Common Types =======

/**
 * Base template properties
 */
export interface BaseTemplateProps {
  previewText?: string
  children: ReactNode
}

/**
 * Layout properties
 */
export interface LayoutProps extends BaseTemplateProps {
  title: string
  footerText?: string
  unsubscribeEmail?: string
  logoUrl?: string
  backgroundColor?: string
  textColor?: string
  accentColor?: string
}

/**
 * Component properties
 */
export interface ButtonProps {
  href: string
  children: ReactNode
  color?: string
  align?: 'left' | 'center' | 'right'
  fullWidth?: boolean
}

export interface SectionProps {
  children: ReactNode
  backgroundColor?: string
  padding?: string
  marginTop?: string
  marginBottom?: string
  border?: string
  borderRadius?: string
}

export interface HeadingProps {
  children: ReactNode
  level?: 1 | 2 | 3
  align?: 'left' | 'center' | 'right'
  color?: string
}

export interface DividerProps {
  color?: string
  margin?: string
}

export interface ImageProps {
  src: string
  alt: string
  width?: number | string
  height?: number | string
  maxWidth?: string
  align?: 'left' | 'center' | 'right'
  border?: string
  borderRadius?: string
}

// ====== Email Components =======

/**
 * Main email layout
 */
export function EmailLayout({
  title,
  previewText = '',
  footerText,
  unsubscribeEmail,
  logoUrl,
  backgroundColor = '#ffffff',
  textColor = '#333333',
  accentColor = '#2563eb',
  children,
}: LayoutProps) {
  const year = new Date().getFullYear()
  const footerDefaultText = `© ${year} Hudson Digital Solutions. All rights reserved.`
  
  // Ensure accentColor is recognized as used (it's used in template HTML below)
  void accentColor

  // Generate HTML for components
  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>${title}</title>
        <style>
          @media only screen and (max-width: 620px) {
            table.body {
              width: 100%;
              min-width: 100%;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            .btn-full {
              width: 100% !important;
            }
          }
        </style>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: ${textColor}; margin: 0; padding: 0; background-color: ${backgroundColor === '#ffffff' ? '#f9fafb' : backgroundColor};">
        <!-- Preheader text (for email clients) -->
        <div style='display: none; max-height: 0px; overflow: hidden;'>
          ${previewText}
          <!-- Whitespace for gmail -->
          &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
        </div>
        
        <table class="body" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" align="center" style="max-width: 600px; margin: 20px auto; background-color: ${backgroundColor}; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td>
              <!-- Header -->
              ${
                logoUrl
                  ? `
              <table width="100%" style="border-bottom: 1px solid #e5e7eb; padding: 20px;">
                <tr>
                  <td align='center'>
                    <img src="${logoUrl}" alt="Hudson Digital Solutions" style="max-width: 200px; height: auto;">
                  </td>
                </tr>
              </table>
              `
                  : ''
              }
              
              <!-- Main Content -->
              <table width="100%" style="padding: 20px 30px;">
                <tr>
                  <td>
                    ${children}
                  </td>
                </tr>
              </table>
              
              <!-- Footer -->
              <table width="100%" style="border-top: 1px solid #e5e7eb; padding: 20px; font-size: 12px; color: #6b7280; text-align: center;">
                <tr>
                  <td>
                    <p>${footerText || footerDefaultText}</p>
                    ${
                      unsubscribeEmail
                        ? `
                    <p>You're receiving this email because you've interacted with our website or services. 
                    <a href="https://hudsondigitalsolutions.com/unsubscribe?email=${encodeURIComponent(unsubscribeEmail)}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a></p>
                    `
                        : ''
                    }
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `

  return html
}

/**
 * Email heading component
 */
export function Heading({
  children,
  level = 2,
  align = 'left',
  color,
}: HeadingProps) {
  const fontSize = level === 1 ? '28px' : level === 2 ? '22px' : '18px'
  const marginBottom = level === 1 ? '25px' : '20px'
  const fontWeight = level === 3 ? '600' : '700'

  const styleAttr = `font-size: ${fontSize}; font-weight: ${fontWeight}; margin-top: 0; margin-bottom: ${marginBottom}; text-align: ${align};${color ? ` color: ${color};` : ''}`

  const tag = `h${level}`
  return `<${tag} style="${styleAttr}">${children}</${tag}>`
}

/**
 * Email paragraph component
 */
export function Paragraph({
  children,
  align = 'left',
  marginBottom = '16px',
}: {
  children: ReactNode
  align?: 'left' | 'center' | 'right'
  marginBottom?: string
}) {
  return `<p style="margin-top: 0; margin-bottom: ${marginBottom}; text-align: ${align};">${children}</p>`
}

/**
 * Email button component
 */
export function Button({
  href,
  children,
  color = '#2563eb',
  align = 'left',
  fullWidth = false,
}: ButtonProps) {
  return `
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
      <tr>
        <td align="${align}">
          <table border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center" style="border-radius: 4px;" bgcolor="${color}">
                <a href="${href}" target="_blank" class="${fullWidth ? 'btn-full' : ''}" style="font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; border-radius: 4px; padding: 12px 24px; display: inline-block; font-weight: 500;">${children}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `
}

/**
 * Email section component
 */
export function Section({
  children,
  backgroundColor = '#f9fafb',
  padding = '20px',
  marginTop = '25px',
  marginBottom = '25px',
  border = '1px solid #e5e7eb',
  borderRadius = '4px',
}: SectionProps) {
  return `
    <div style='background-color: ${backgroundColor}; padding: ${padding}; margin-top: ${marginTop}; margin-bottom: ${marginBottom}; border: ${border}; border-radius: ${borderRadius};'>
      ${children}
    </div>
  `
}

/**
 * Email divider component
 */
export function Divider({
  color = '#e5e7eb',
  margin = '25px 0',
}: DividerProps) {
  return `<hr style="border: 0; border-top: 1px solid ${color}; margin: ${margin};"/>`
}

/**
 * Email image component
 */
export function Image({
  src,
  alt,
  width,
  height,
  maxWidth = '100%',
  align = 'center',
  border,
  borderRadius,
}: ImageProps) {
  const styleAttr = `max-width: ${maxWidth}; height: auto;${width ? ` width: ${typeof width === 'number' ? `${width}px` : width};` : ''}${height ? ` height: ${typeof height === 'number' ? `${height}px` : height};` : ''}${border ? ` border: ${border};` : ''}${borderRadius ? ` border-radius: ${borderRadius};` : ''}`

  return `
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
      <tr>
        <td align="${align}">
          <img src="${src}" alt="${alt}" style="${styleAttr}"/>
        </td>
      </tr>
    </table>
  `
}

/**
 * Email list component
 */
export function List({
  items,
  type = 'ul',
  spacing = '10px',
}: {
  items: string[]
  type?: 'ul' | 'ol'
  spacing?: string
}) {
  const listItems = items
    .map(item => `<li style="margin-bottom: ${spacing};">${item}</li>`)
    .join('')
  return `<${type} style="padding-left: 20px; margin-bottom: 20px;">${listItems}</${type}>`
}

/**
 * Blockquote component
 */
export function Blockquote({
  children,
  borderColor = '#2563eb',
  backgroundColor = '#f3f4f6',
}: {
  children: ReactNode
  borderColor?: string
  backgroundColor?: string
}) {
  return `
    <blockquote style="margin: 20px 0; padding: 15px; background-color: ${backgroundColor}; border-left: 4px solid ${borderColor}">
      ${children}
    </blockquote>
  `
}

/**
 * Two column layout
 */
export function TwoColumns({
  left,
  right,
}: {
  left: ReactNode
  right: ReactNode
}) {
  return `
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
      <tr>
        <td valign="top" style="width: 50%; padding-right: 10px;">
          ${left}
        </td>
        <td valign="top" style="width: 50%; padding-left: 10px;">
          ${right}
        </td>
      </tr>
    </table>
  `
}

// ====== Pre-built Email Templates =======

/**
 * Simple message template for standard notifications
 */
export function SimpleMessage({
  title,
  previewText,
  heading,
  message,
  buttonText,
  buttonUrl,
  imageUrl,
  imageAlt,
  footerText,
  unsubscribeEmail,
  logoUrl,
  accentColor = '#2563eb',
}: {
  title: string
  previewText?: string
  heading: string
  message: string
  buttonText?: string
  buttonUrl?: string
  imageUrl?: string
  imageAlt?: string
  footerText?: string
  unsubscribeEmail?: string
  logoUrl?: string
  accentColor?: string
}) {
  const content = `
    ${Heading({ children: heading, level: 1, color: accentColor })}
    ${imageUrl ? Image({ src: imageUrl, alt: imageAlt || heading }) : ''}
    ${Paragraph({ children: message })}
    ${buttonText && buttonUrl ? Button({ href: buttonUrl, color: accentColor, children: buttonText }) : ''}
  `

  return EmailLayout({
    title,
    previewText,
    footerText,
    unsubscribeEmail,
    logoUrl,
    accentColor,
    children: content,
  })
}

/**
 * Contact form confirmation template
 */
export function ContactFormConfirmation({
  name,
  email,
  message,
  logoUrl,
  accentColor,
}: {
  name: string
  email: string
  message: string
  logoUrl?: string
  accentColor?: string
}) {
  const content = `
    ${Heading({ children: "We've Received Your Message", level: 1, color: accentColor })}
    ${Paragraph({ children: `Hi ${name},` })}
    ${Paragraph({ children: "Thank you for contacting Hudson Digital Solutions. We've received your message and will get back to you shortly." })}
    ${Paragraph({ children: "Here's a copy of what you submitted:" })}
    ${Section({
      children: `
        ${Paragraph({ children: message })}
      `,
    })}
    ${Paragraph({ children: 'We typically respond within 1 business day.' })}
    ${Paragraph({ children: 'Best regards,<br>The Hudson Digital Solutions Team' })}
  `

  return EmailLayout({
    title: 'Thank you for your message',
    previewText: "We've received your message and will respond shortly",
    unsubscribeEmail: email,
    logoUrl,
    accentColor,
    children: content,
  })
}

/**
 * Newsletter welcome template
 */
export function NewsletterWelcome({
  name,
  email,
  logoUrl,
  accentColor,
}: {
  name?: string
  email: string
  logoUrl?: string
  accentColor?: string
}) {
  const greeting = name ? `Hi ${name},` : 'Hello,'

  const content = `
    ${Heading({ children: 'Welcome to Our Newsletter!', level: 1, color: accentColor })}
    ${Paragraph({ children: greeting })}
    ${Paragraph({ children: "Thank you for subscribing to the Hudson Digital Solutions newsletter. We're excited to share our latest insights, industry trends, and digital transformation strategies with you." })}
    ${Paragraph({ children: "Here's what you can expect:" })}
    ${List({
      items: [
        'Monthly updates on emerging technologies',
        'Expert tips for optimizing your digital business',
        'Case studies and success stories',
        'Exclusive offers and resources',
      ],
    })}
    ${Paragraph({ children: "If you have any questions or topics you'd like us to cover, feel free to reply to this email." })}
    ${Button({
      href: 'https://hudsondigitalsolutions.com/resources',
      children: 'Explore Our Resources',
      color: accentColor,
    })}
  `

  return EmailLayout({
    title: 'Welcome to the Hudson Digital Solutions Newsletter',
    previewText: 'Thank you for subscribing to our newsletter',
    unsubscribeEmail: email,
    logoUrl,
    accentColor,
    children: content,
  })
}

/**
 * Lead magnet delivery template
 */
export function LeadMagnetDelivery({
  name,
  email,
  resourceName,
  downloadLink,
  logoUrl,
  accentColor,
}: {
  name?: string
  email: string
  resourceName: string
  downloadLink: string
  logoUrl?: string
  accentColor?: string
}) {
  const greeting = name ? `Hi ${name},` : 'Hello,'

  const content = `
    ${Heading({ children: `Your ${resourceName} is Ready!`, level: 1, color: accentColor })}
    ${Paragraph({ children: greeting })}
    ${Paragraph({ children: `Thank you for your interest in our resources. Here's your copy of <strong>${resourceName}</strong> that you requested.` })}
    ${Section({
      children: `
        ${Paragraph({ children: 'Click the button below to access your resource:', align: 'center' })}
        ${Button({
          href: downloadLink,
          children: 'Download Now',
          color: accentColor,
          align: 'center',
        })}
      `,
      backgroundColor: '#f3f4f6',
    })}
    ${Paragraph({ children: "We hope you find this resource valuable. If you have any questions or need further assistance, don't hesitate to contact our team." })}
    ${Paragraph({ children: 'Want to learn more about how we can help your business thrive in the digital landscape?' })}
    ${Button({
      href: 'https://hudsondigitalsolutions.com/contact',
      children: 'Contact Us',
      color: accentColor,
    })}
  `

  return EmailLayout({
    title: `Your Requested Resource: ${resourceName}`,
    previewText: `Your ${resourceName} download is ready`,
    unsubscribeEmail: email,
    logoUrl,
    accentColor,
    children: content,
  })
}

/**
 * Renders an email template to HTML
 */
export function renderEmailTemplate(
  template: string,
  dynamicFields: Record<string, string> = {},
): string {
  // Replace dynamic fields in template
  let renderedTemplate = template

  for (const [key, value] of Object.entries(dynamicFields)) {
    const regex = new RegExp(`{${key}}`, 'g')
    renderedTemplate = renderedTemplate.replace(regex, value)
  }

  return renderedTemplate
}
