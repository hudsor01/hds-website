---
title: 'Website Migration Checklist: Move Without Losing SEO'
slug: website-migration-checklist
excerpt: >-
  A website migration checklist that protects your SEO, preserves revenue
  tracking and cuts downtime. Built for DFW businesses moving platforms.
targetKeyword: website migration checklist
pillar: 6
tags:
  - website-migration
author: richard-hudson
publishedAt: '2026-03-15'
published: true
featured: false
featureImage: ''
readingTime: 0
bodyFormat: markdown
---

Most site moves tank revenue before the new domain even points to DNS. I treat a website as a revenue system, not a brochure. When you shift hosts, swap CMS platforms or rebuild the architecture from scratch, every broken redirect and orphaned page drains your pipeline. I have spent nearly a decade in revenue operations tracking Salesforce pipelines, routing HubSpot leads through Workato and forecasting $3.7 million in quarterly targets. I know exactly where money leaks during a platform shift. That is why you need a proper website migration checklist before you touch production traffic. The goal is simple. Move the assets, keep the rankings and preserve the attribution layers without waking your sales team to missed bookings. I run these migrations like deployment cycles in a revenue engine, not marketing projects that live or die by aesthetics.

## Pre-Migration Audit and Baseline Mapping

You cannot protect what you have not mapped. I start every Dallas-Fort Worth site migration with a full crawl using Screaming Frog or Sitebulb. I pull the URL inventory, export it to Power BI and run a baseline against your current conversion paths. I look for the pages that actually move revenue, not just the ones that get vanity traffic. You need to log every inbound link from local directories, partner sites and press mentions across the DFW metroplex. I also export your existing Open Graph tags, schema markup and canonical tags because search engines use them to understand context. If you skip this step you will spend months rebuilding authority that already existed in your old stack.

I track the top twenty percent of pages that drive eighty percent of your conversions. Those get priority routing. I run a spreadsheet comparing old URLs to new structures, flagging any parameter-heavy tracking links that your analytics platform relies on. I also check your robots.txt and sitemap.xml files against the new environment before deployment. You want zero crawl errors on day one. I set up a staging domain, push the build there and run a full redirect mapping test using a Python script or a bulk CSV import into your URL manager. If a single high-traffic page points to a 404, your forecast accuracy drops and your sales team starts chasing ghosts. I verify load times on staging too because a slow launch kills mobile conversions before your marketing team even sees the lead.

## The Redirect Strategy and Routing Logic

Redirects are the backbone of a website migration checklist. I do not trust default URL shifters or platform auto-mappers. They miss edge cases and create redirect chains that kill page speed and dilute link equity. I build explicit 301 rules in Nginx or Cloudflare Workers, mapping old paths to their exact new equivalents. When a customer clicks an old link they land on the correct page in under two hundred milliseconds. I test every route manually and validate them against Google Search Console crawl stats.

I also handle parameter stripping carefully. Your tracking parameters live in UTM strings and session cookies, not in the actual page path. I use canonical tags to point search engines to the clean URL and let your analytics layer handle the rest. If you are moving from WordPress to Webflow or Shopify, I rebuild your routing logic in the new platform’s handler file. I never rely on a plugin to manage ten thousand redirects for you. Plugins cache aggressively and break when traffic spikes during launch. Hard-coded rules or edge-side includes stay stable and load fast. I also map your internal linking structure to preserve click depth, because search crawlers follow those pathways to discover new content faster.

## Analytics, Tracking and Revenue Systems Handoff

A migration without a tracking handoff is just a digital leak. I rebuild your attribution model before launch day. I audit the GA4 properties, re-verify the Google Tag Manager container and cross-check every event with your Salesforce or HubSpot pipeline stages. I map form submissions to deal creation, track phone call routing with CallRail or Twilio and verify that payment gateways fire the correct webhook payloads. I also update your offline conversion imports so historical data flows back into your ad accounts without gaps.

I run a shadow test by submitting mock leads through the new forms and watching them hit your CRM in real time. I check field mapping, lead scoring rules and automated email triggers. If a booking lands in the wrong queue or misses a follow-up sequence, your close rate drops and your CAC climbs. I also rebuild your schema markup using structured data templates that match your new HTML structure. I validate it with Google’s Rich Results test and push the updated JSON-LD to production. Clean markup means better click-through rates from local search and faster indexing of your new pages. I tie everything back to a single dashboard so you can watch pipeline velocity shift from day one.

### The Execution Checklist

I run migrations on a strict sequence to avoid scope creep and technical debt. Here is the exact order I follow for every DFW client:

- Export full URL inventory and baseline conversion metrics
- Map old paths to new structures in a master CSV file
- Build 301 redirects on staging and test for chains or loops
- Rebuild GA4 conversions, GTM triggers and CRM webhooks
- Validate schema markup, canonical tags and robots.txt rules
- Dry-run form submissions with mock deals in Salesforce or HubSpot
- Freeze content updates and take a full database backup
- Point DNS to new server, activate SSL and enable CDN caching
- Monitor crawl stats, Core Web Vitals and index coverage for fourteen days

## Launch Protocol and Post-Migration Monitoring

I never push a major migration on a Tuesday. Wednesday afternoon or Thursday morning gives your team four business days to catch issues before the weekend traffic surge. I freeze content updates at least seventy-two hours before deployment and take a full database backup with exportable media libraries. I point DNS to the new server only after SSL certificates are active, CDN caching is configured and all redirects pass validation. I monitor Core Web Vitals in real time because a slow launch kills mobile conversions before your sales team even sees the lead.

Once live, I watch crawl stats, index coverage and server response codes for fourteen days straight. I check bounce rates on high-value pages to catch broken trust signals or missing content blocks. I run a fresh SEO audit using Ahrefs and SEMrush to compare backlink profiles before and after the move. I also verify that your local business schema matches your Dallas-Fort Worth NAP details exactly, because Google uses those signals to rank you in the map pack. If a metric drifts, I roll back the specific route or fix the template without touching the whole build. I keep your marketing team out of the technical weeds so they can focus on outreach and closing deals.

## Cost, Time and ROI Reality

Site migrations cost money and they take time. I estimate labor based on the size of your URL inventory, the complexity of your routing logic and the depth of your tracking stack. A twenty-page service site moves in five business days with minimal risk. A three-thousand-page e-commerce or lead generation platform requires two weeks of staging, testing and quality assurance. I use a cost estimator to break down hosting, development hours and third-party API fees so you see the real numbers before signing a purchase order. I also run an ROI calculator to show how reduced bounce rates, faster load times and restored conversion paths pay for the project within ninety days.

You do not need a bloated agency retainer to execute this properly. I build lean migration workflows that focus on traffic preservation, revenue routing and technical stability. We handle the heavy lifting so your marketing team stops firefighting broken forms and starts closing deals. I track every metric that matters, from index growth to pipeline velocity and I adjust the build until the numbers align with your forecast. I also document every routing rule and tracking event in a shared knowledge base so your internal team can troubleshoot without waiting on external support. That kind of operational clarity compounds over time and keeps your CAC flat while your conversion rate climbs.

## Next Steps for Your DFW Business

If you are planning a platform shift or a full rebuild, do not guess at the routing. I will walk you through the exact migration steps, map your redirects and lock in your tracking before we touch production traffic. Book a call through [our services](/services) page and I will send you a custom migration timeline, cost breakdown and risk assessment within forty-eight hours. We keep your rankings intact and your pipeline full while you focus on selling.

Let’s get it done right. [Get started today](/contact) and we will start mapping your routes before the next quarter closes. I treat every migration like a revenue handoff, not a cosmetic refresh. Your numbers will prove it within thirty days of launch.
