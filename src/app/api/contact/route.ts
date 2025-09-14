import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { RateLimiter } from "@/lib/rate-limiter";
import { applySecurityHeaders } from "@/lib/security-headers";
import { recordContactFormSubmission } from "@/lib/metrics";
import {
  escapeHtml,
  sanitizeEmailHeader,
  detectInjectionAttempt,
} from "@/lib/security-utils";
import { verifyCSRFToken } from "@/lib/csrf";
import {
  EMAIL_SEQUENCES,
  processEmailTemplate,
} from "@/lib/email-sequences";
import { scheduleEmailSequence } from "@/lib/scheduled-emails";
import { validateRequestWithZod } from "@/lib/validation";
import { contactFormSchema, scoreLeadFromContactData } from "@/lib/schemas/contact";
import type { ContactFormData } from "@/lib/schemas/contact";

// Initialize rate limiter for contact form
const rateLimiter = new RateLimiter();
const CONTACT_FORM_LIMITS = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 3, // 3 contact form submissions per 15 minutes
};

// Get client IP from request
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const parts = forwardedFor.split(",");
    const first = parts.length > 0 && parts[0] ? parts[0].trim() : "";
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp && realIp.trim()) return realIp.trim();

  return "unknown";
}

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Secure email template with HTML escaping and lead scoring
function generateAdminNotificationHTML(
  data: ContactFormData,
  leadScore?: number,
  sequenceId?: string
): string {
  // All user input is HTML-escaped to prevent injection
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #0891b2;">New Contact Form Submission</h1>
      
      <div style="background: white; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; margin: 20px 0;">
        <h2>Contact Information</h2>
        <p><strong>Name:</strong> ${escapeHtml(data.firstName)} ${escapeHtml(
    data.lastName
  )}</p>
        <p><strong>Email:</strong> <a href="mailto:${escapeHtml(
          data.email
        )}">${escapeHtml(data.email)}</a></p>
        ${
          data.phone
            ? `<p><strong>Phone:</strong> <a href="tel:${escapeHtml(
                data.phone
              )}">${escapeHtml(data.phone)}</a></p>`
            : ""
        }
        ${
          data.company
            ? `<p><strong>Company:</strong> ${escapeHtml(data.company)}</p>`
            : ""
        }
        ${
          data.service
            ? `<p><strong>Service Interest:</strong> ${escapeHtml(
                data.service
              )}</p>`
            : ""
        }
        ${
          data.budget
            ? `<p><strong>Budget:</strong> ${escapeHtml(data.budget)}</p>`
            : ""
        }
        ${
          data.timeline
            ? `<p><strong>Timeline:</strong> ${escapeHtml(data.timeline)}</p>`
            : ""
        }
      </div>

      ${
        leadScore
          ? `
      <div style="background: ${
        leadScore >= 70 ? "#dcfce7" : leadScore >= 40 ? "#fef3c7" : "#fef2f2"
      }; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="color: ${
          leadScore >= 70 ? "#15803d" : leadScore >= 40 ? "#d97706" : "#dc2626"
        };">Lead Intelligence</h2>
        <p><strong>Lead Score:</strong> ${leadScore}/100 ${
              leadScore >= 70
                ? "(HIGH PRIORITY)"
                : leadScore >= 40
                ? "(QUALIFIED)"
                : "(NURTURE)"
            }</p>
        <p><strong>Email Sequence:</strong> ${
          sequenceId || "standard-prospect"
        }</p>
        <p><strong>Recommended Action:</strong> ${
          leadScore >= 70
            ? "Schedule call within 24 hours"
            : leadScore >= 40
            ? "Follow up within 2-3 days"
            : "Add to nurture sequence"
        }</p>
      </div>
      `
          : ""
      }

      <div style="background: #f1f5f9; padding: 20px; border-radius: 8px;">
        <h2>Message</h2>
        <p style="white-space: pre-wrap;">${escapeHtml(data.message)}</p>
      </div>

      <p style="margin-top: 30px; color: #64748b; font-size: 12px;">
        Submitted: ${new Date().toLocaleString()}<br>
        Source: Hudson Digital Solutions Contact Form<br>
        ${
          leadScore
            ? `Lead Score: ${leadScore}/100 | Sequence: ${sequenceId}`
            : ""
        }
      </p>
    </div>
  `;
}

export async function POST(request: NextRequest) {
  try {
    // Step 1: Verify CSRF token for security
    const csrfToken = request.headers.get("x-csrf-token");
    if (!csrfToken || !verifyCSRFToken(csrfToken, request)) {
      return NextResponse.json(
        {
          error:
            "Invalid security token. Please refresh the page and try again.",
        },
        { status: 403 }
      );
    }

    // Step 2: Check rate limiting
    const clientIP = getClientIP(request);
    const isLimited = await rateLimiter.checkLimit(
      `contact-form:${clientIP}`,
      CONTACT_FORM_LIMITS.maxRequests,
      CONTACT_FORM_LIMITS.windowMs
    );

    if (isLimited) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in 15 minutes." },
        { status: 429 }
      );
    }

    // Step 3: Validate request body with enhanced Zod schema
    const validation = await validateRequestWithZod(request, contactFormSchema);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", errors: validation.errors, message: validation.message },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Step 5: Detect potential injection attempts for monitoring
    const fieldsToCheck = [
      data.firstName,
      data.lastName,
      data.email,
      data.message,
      data.company,
    ].filter(Boolean);
    const suspiciousActivity = fieldsToCheck.some((field) =>
      detectInjectionAttempt(field as string)
    );

    if (suspiciousActivity) {
      console.warn("Potential injection attempt detected from IP:", clientIP);
      // Log but still process if validation passed - the input is already sanitized
    }

    // Step 6: Calculate lead score using enhanced algorithm
    const leadScoring = scoreLeadFromContactData(data);
    const leadScore = leadScoring.score;

    const sequenceId = leadScoring.sequenceType;
    const sequence = EMAIL_SEQUENCES[sequenceId];

    // Prepare email variables for sequences
    const emailVariables = {
      firstName: data.firstName,
      lastName: data.lastName || "",
      company: data.company || "your business",
      service: data.service || "web development",
      email: data.email,
    };

    // Step 7: Send admin notification email with lead score
    if (resend) {
      try {
        // Sanitize email subject to prevent header injection
        const safeSubject = sanitizeEmailHeader(
          `New Project Inquiry - ${data.firstName} ${data.lastName} (Score: ${leadScore})`
        );

        // Send admin notification with lead scoring info
        await resend.emails.send({
          from: "Hudson Digital <noreply@hudsondigitalsolutions.com>",
          to: ["hello@hudsondigitalsolutions.com"],
          subject: safeSubject,
          html: generateAdminNotificationHTML(data, leadScore, sequenceId),
        });

        // Send immediate welcome/follow-up email to prospect based on sequence
        const firstStep = sequence?.steps?.find((step) => step.delayDays === 0);
        if (firstStep) {
          const processedContent = processEmailTemplate(
            firstStep.content,
            emailVariables
          );
          const processedSubject = processEmailTemplate(
            firstStep.subject,
            emailVariables
          );

          await resend.emails.send({
            from: "Richard Hudson <hello@hudsondigitalsolutions.com>",
            to: [data.email],
            subject: sanitizeEmailHeader(processedSubject),
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6;">
              ${processedContent
                .split("\n")
                .map((line) => `<p>${escapeHtml(line)}</p>`)
                .join("")}
            </div>`,
          });
        }

        // Send Discord notification if webhook URL is configured
        if (process.env.DISCORD_WEBHOOK_URL) {
          try {
            await fetch(process.env.DISCORD_WEBHOOK_URL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                embeds: [
                  {
                    title: "New Project Inquiry",
                    color: 0x0891b2, // Blue color
                    fields: [
                      {
                        name: "Contact",
                        value: `**${escapeHtml(data.firstName)} ${escapeHtml(
                          data.lastName
                        )}**\n${escapeHtml(data.email)}${
                          data.phone ? `\n${escapeHtml(data.phone)}` : ""
                        }`,
                        inline: true,
                      },
                      {
                        name: "Details & Score",
                        value: `**Lead Score:** ${leadScore}/100\n**Service:** ${escapeHtml(
                          data.service || "Not specified"
                        )}\n**Company:** ${escapeHtml(
                          data.company || "Not specified"
                        )}\n**Sequence:** ${sequenceId}`,
                        inline: true,
                      },
                      {
                        name: "Message",
                        value: escapeHtml(
                          data.message.length > 1000
                            ? data.message.substring(0, 1000) + "..."
                            : data.message
                        ),
                        inline: false,
                      },
                    ],
                    timestamp: new Date().toISOString(),
                    footer: {
                      text: "Hudson Digital Solutions Contact Form",
                    },
                  },
                ],
              }),
            });
          } catch (discordError) {
            console.error("Failed to send Discord notification:", discordError);
            // Don't fail the request if Discord fails
          }
        }

        // Record successful submission
        recordContactFormSubmission(true);

        const response = NextResponse.json({
          message: "Thank you! Your message has been sent successfully.",
          success: true,
        });

        // Schedule follow-up emails in the sequence (after successful email send)
        scheduleEmailSequence(
          data.email,
          `${data.firstName} ${data.lastName}`,
          sequenceId,
          emailVariables
        );

        return applySecurityHeaders(response);
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        recordContactFormSubmission(false);

        return NextResponse.json(
          { error: "Failed to send message. Please try again." },
          { status: 500 }
        );
      }
    } else {
      // Schedule follow-up emails even if email service is not configured
      scheduleEmailSequence(
        data.email,
        `${data.firstName} ${data.lastName}`,
        sequenceId,
        emailVariables
      );

      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Contact form API error:", error);
    recordContactFormSubmission(false);

    const response = NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );

    return applySecurityHeaders(response);
  }
}
