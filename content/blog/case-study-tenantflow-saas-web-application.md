---
title: 'Case Study: Building TenantFlow, a SaaS Web Application'
slug: case-study-tenantflow-saas-web-application
excerpt: >-
  How I built TenantFlow, my own SaaS web application for small landlords:
  the scope cuts, the security model, billing that stays correct and the real numbers.
targetKeyword: saas web application
pillar: 10
tags:
  - web-development
  - business-automation
author: richard-hudson
publishedAt: '2026-11-09'
published: true
featured: false
featureImage: ''
readingTime: 0
bodyFormat: markdown
---

TenantFlow is a SaaS web application I built and run myself. It is property management software for independent landlords and small property managers: the owner with a fourplex, a few rent houses or a couple dozen units. That group sits in a gap. They are too big for spreadsheets and too small for the enterprise platforms built for property management companies with hundreds of doors.

This is not a client story. There is no client, so there are no client numbers to quote. What I can show you is what got built, the decisions behind it and what those decisions mean if you are thinking about software for your own business. Everything below is checkable on [tenantflow.app](https://tenantflow.app) or in the code.

## What TenantFlow Does

A landlord signs up, adds properties and units and gets one place to run the business:

- **Properties, units, tenants and leases**, with a lease lifecycle from draft to pending signature to active to expired
- **E-signing built in.** Tenants sign a lease from a secure link. No account, no app to download.
- **Rental applications** through the same kind of link
- **Maintenance requests** on a board with photo uploads and vendor assignment
- **Inspections and a document vault** with search and a zip export
- **A rent ledger** that posts monthly charges automatically
- **Financial reports**: income statement, cash flow, expenses and year-end tax documents
- **CSV import**, so nobody retypes a portfolio that already lives in a spreadsheet

Pricing is flat: Starter at $19 a month, Growth at $49 and Max at $149, each capped by property and unit count. Every plan starts with a 14-day trial and no credit card.

## The Biggest Decision Was What to Leave Out

Most property management software assumes tenants will log in. They get a portal, they pay rent through it, they submit requests through it. On paper that sounds complete. In practice a landlord with eight units now has to convince eight households to create accounts and learn another app. Plenty of them never will.

So TenantFlow has no tenant portal. Tenants are records the landlord manages, not users the landlord has to onboard. Online rent collection and applicant screening are out of scope on purpose too. Each one drags in its own compliance work, support load and failure modes. Cutting them let me build the parts a small landlord uses every week and build them well.

I spent nearly a decade in revenue operations working in Salesforce, HubSpot and Power BI. The pattern there was the same. The systems that got used were the ones that fit how people already worked. The ones loaded with features nobody asked for became expensive shelfware. If you are scoping a project of your own, the list of things you won't build matters as much as the list you will. I wrote more about that in [how to plan a website project that pays off](/blog/your-website-needs-a-blueprint-how-to-plan-a-project-that-pays-off).

## How I Built This SaaS Web Application

The stack today is deliberately boring:

- **Next.js and React** on Vercel for the app and the marketing site
- **Supabase** for Postgres, authentication, file storage and server-side functions
- **Stripe** for subscriptions, called only from server-side functions, never from the browser
- **Resend** for transactional email
- **Sentry** for error monitoring

It did not start that way. The first version was a plain React app. A separate Node backend came next, then a monorepo to hold it all together. Over time I deleted the separate backend and flattened the monorepo into one standard Next.js app with the database doing more of the work. Every layer I removed was one less thing to deploy, patch and debug. That is the same reason I [build client sites on Next.js instead of WordPress](/blog/why-we-build-on-nextjs-not-wordpress): fewer moving parts break less often.

## Security: Each Landlord Only Sees Their Own Data

In software that holds leases, addresses and financial records, the worst bug is one landlord seeing another landlord's data. I didn't want that guarantee to depend on every query in the app being written correctly. It lives in the database instead.

Every table has row-level security. Postgres itself checks who is asking before it returns a single row. The app never holds the database's master key. Then I test it. On every pull request an automated suite signs in as two separate landlord accounts against the production database and confirms neither one can read or change the other's records. If that check fails, the change does not ship.

On top of that:

- Login and every page inside the app get a stricter content security policy, generated fresh on each request
- Two-factor authentication is available on every account
- Code scanning, secret scanning and a daily dependency audit run on their own schedule

None of this is visible to a landlord, which is the point. If you want the small business version of the same habits, [who owns your website and domain](/blog/who-owns-your-website-and-domain) is a good place to start.

## Billing That Stays Correct

Subscription billing has a nasty failure mode. Stripe can send the same event twice, or send two events out of order. Handle that carelessly and a customer who upgraded gets downgraded, or gets charged for a plan they cancelled.

TenantFlow records every Stripe event it has already processed and ignores repeats. It also refuses to apply an older event on top of a newer one. Money is stored in dollars in the database and only converted to cents at the point it goes to Stripe, so the rounding happens in exactly one place.

The rent ledger works on the same principle. It is append-only. A landlord cannot quietly edit last month's charge. Corrections go in as reversal entries, the way an accountant would want them, so the history always adds up.

If payments are part of your own site, [Stripe payment setup for small business](/blog/stripe-payment-setup-small-business) covers the parts that matter at a smaller scale.

## Only Promise What the Product Does

Partway through, I audited the marketing site against the product, line by line. Anything the site claimed that the code didn't actually do got fixed or cut. That audit found two plan limits that were advertised but not enforced: the monthly e-signature allowance and the storage quota. So I built the enforcement instead of quietly hoping nobody noticed.

It is the same standard I hold this site to. A feature list is a promise. If the product can't keep it, it doesn't belong on the page.

## The Real Numbers

Here is what I can count:

- **Built and maintained by one developer:** me
- **Development time:** from June 2025 to today, shipping continuously
- **Commits:** nearly 7,000
- **Database migrations:** 349, each one replayed against an empty database every week to prove the schema still builds from scratch
- **Automated tests:** about 320 unit test files, 62 row-level security test files that run against production and 31 end-to-end browser test suites, including an accessibility check
- **Pricing:** $19, $49 and $149 a month, with a 14-day trial

What I won't give you is a revenue chart or a customer count I can't back up. When TenantFlow has numbers worth publishing, they will go here.

## What This Means for Your Project

You probably don't need a full SaaS platform. You might need a client portal, an online booking flow or a website wired into your CRM so leads stop falling through the cracks. The lessons carry over at any size:

1. **Cut scope on purpose.** Build what gets used every week.
2. **Put the rules where they can't be skipped.** If something must never happen, enforce it in the database or the payment system, not in a reminder.
3. **Test what you promise.** If the site says it, the product should do it.
4. **Keep the stack small.** Every service you add is one more thing to pay for and maintain. Hosting is no exception, which is why [I rarely recommend Kubernetes to a small business](/blog/kubernetes-for-small-business-is-it-worth-it).

If you have a process that lives in spreadsheets and email right now, [tell me about it](/contact). I'll tell you whether it needs custom software, an off-the-shelf tool or just a better website. If it turns out you only need a better website, start with [when a website builder is enough and when a custom build pays off](/blog/custom-website-vs-website-builder). You can see TenantFlow and the rest of my work on the [showcase](/showcase).
