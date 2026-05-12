# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this codebase or in the live site at
https://hudsondigitalsolutions.com, please report it privately.

**Do not** open a public GitHub issue for security reports.

### How to report

- Email: **hello@hudsondigitalsolutions.com**
- Subject line: `Security: <brief summary>`
- Include:
  - Affected URL, endpoint, or file path
  - Reproduction steps
  - Impact assessment (data exposure, privilege escalation, etc.)
  - Any proof-of-concept code or screenshots

You should expect an acknowledgement within **3 business days** and a status
update within **10 business days**.

### Scope

In scope:

- The production site (`hudsondigitalsolutions.com`) and its subdomains
- API routes under `/api/*`
- Any application code in this repository

Out of scope:

- Third-party services (Vercel, Neon, Resend, Upstash) — report directly to the
  vendor
- Denial-of-service or volumetric attacks
- Social engineering or phishing
- Issues already triaged in this repository's Dependabot alerts

### Disclosure

After a fix is deployed, public disclosure is welcomed once 90 days have passed
or the issue is otherwise patched, whichever is sooner. We're happy to credit
the reporter unless you'd prefer to remain anonymous.
