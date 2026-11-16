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

Most site moves tank revenue before the new domain even points to DNS. I treat a website as a revenue system, not a brochure. When you shift hosts, swap CMS platforms or rebuild the architecture from scratch, every broken redirect and orphaned page drains your pipeline. I have spent nearly a decade in revenue operations tracking Salesforce pipelines, routing HubSpot leads through Workato and driving $3.7 million in revenue through forecasting. I know exactly where money leaks during a platform shift. That is why you need a proper website migration checklist before you touch production traffic. The goal is simple. Move the assets, keep the rankings and preserve the attribution layers without waking your sales team to missed bookings. I run these migrations like deployment cycles in a revenue engine, not marketing projects that live or die by aesthetics.

## Pre-Migration Audit and Baseline Mapping

You cannot protect what you have not mapped. I start every site migration with a full crawl using Screaming Frog or Sitebulb. I pull the URL inventory, export it to Power BI and run a baseline against your current conversion paths. I look for the pages that actually move revenue, not just the ones that get vanity traffic. You need to log every inbound link from local directories, partner sites and press mentions across the DFW metroplex. I also export your existing Open Graph tags, schema markup and canonical tags because search engines use them to understand context. If you skip this step you will spend months rebuilding authority that already existed in your old stack.

A small set of pages usually drives most of your conversions. Those get priority routing. I run a spreadsheet comparing old URLs to new structures, flagging any parameter-heavy tracking links that your analytics platform relies on. I also check your robots.txt and sitemap.xml files against the new environment before deployment. You want zero crawl errors on day one. I set up a staging domain, push the build there and run a full redirect mapping test using a Python script or a bulk CSV import into your URL manager. If a single high-traffic page points to a 404, your forecast accuracy drops and your sales team starts chasing ghosts. I verify load times on staging too, because slow pages lose mobile visitors before they ever become leads.

## The Redirect Strategy and Routing Logic

Redirects are the backbone of a website migration checklist. I do not trust default URL shifters or platform auto-mappers. They miss edge cases and create redirect chains that kill page speed and dilute link equity. I build explicit 301 rules in Nginx or Cloudflare Workers, mapping old paths to their exact new equivalents. When a customer clicks an old link they land on the correct page in a single hop. I test every route manually and validate them against Google Search Console crawl stats.

I also handle parameter stripping carefully. Your tracking parameters live in UTM strings and session cookies, not in the actual page path. I use canonical tags to point search engines to the clean URL and let your analytics layer handle the rest. If you are moving off WordPress, I rebuild your routing logic in the new platform’s redirect configuration. Leaving Wix has its own quirks, which I walk through in [how to move off Wix without losing your rankings](/blog/how-to-migrate-off-wix). I never rely on a plugin to manage ten thousand redirects for you. Plugins can cache aggressively and buckle when traffic spikes during launch. Hard-coded rules at the server or edge stay stable and load fast. I also map your internal linking structure to preserve click depth, because search crawlers follow those pathways to discover new content faster.

## Analytics, Tracking and Revenue Systems Handoff

A migration without a tracking handoff is just a digital leak. I rebuild your attribution model before launch day. I audit the GA4 properties, re-verify the Google Tag Manager container and cross-check every event with your Salesforce or HubSpot pipeline stages. I map form submissions to deal creation, track phone call routing with CallRail or Twilio and verify that payment gateways fire the correct webhook payloads. I also update your offline conversion imports so historical data flows back into your ad accounts without gaps.

I run a shadow test by submitting mock leads through the new forms and watching them hit your CRM in real time. I check field mapping, lead scoring rules and automated email triggers. If a booking lands in the wrong queue or misses a follow-up sequence, your close rate drops and your CAC climbs. I also rebuild your schema markup using structured data templates that match your new HTML structure. I validate it with Google’s Rich Results test and push the updated JSON-LD to production. Clean markup gives your new pages a better shot at rich results in local search and helps them get indexed faster. I tie everything back to a single dashboard so you can watch pipeline velocity shift from day one.

### The Execution Checklist

I run migrations on a strict sequence to avoid scope creep and technical debt. Here is the order I follow on every migration:

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

I never push a major migration on a Friday. A Monday or Tuesday launch gives your team the rest of the work week to catch issues before the weekend traffic surge. I freeze content updates at least seventy-two hours before deployment and take a full database backup with exportable media libraries. I point DNS to the new server only after SSL certificates are active, CDN caching is configured and all redirects pass validation. I watch Core Web Vitals in real time on launch day so a slow template gets caught in hours, not weeks.

Once live, I watch crawl stats, index coverage and server response codes for fourteen days straight. I check bounce rates on high-value pages to catch broken trust signals or missing content blocks. I run a fresh SEO audit using Ahrefs and SEMrush to compare backlink profiles before and after the move. I also verify that your local business schema matches your Dallas-Fort Worth NAP details exactly, because Google uses those signals to rank you in the map pack. If a metric drifts, I roll back the specific route or fix the template without touching the whole build. I keep your marketing team out of the technical weeds so they can focus on outreach and closing deals.

## Cost, Time and ROI Reality

Site migrations cost money and they take time. I estimate labor based on the size of your URL inventory, the complexity of your routing logic and the depth of your tracking stack. A small service site is a short project. A large e-commerce or lead generation platform needs far more time for staging, testing and quality assurance. I break down hosting, development hours and third-party API fees so you see the real numbers before signing a purchase order. Then I weigh that cost against what restored conversion paths and faster load times are worth to your pipeline.

You do not need a bloated agency retainer to execute this properly. I build lean migration workflows that focus on traffic preservation, revenue routing and technical stability. I handle the heavy lifting so your marketing team stops firefighting broken forms and starts closing deals. I track every metric that matters, from index growth to pipeline velocity. Then I adjust the build until the numbers align with your forecast. I also document every routing rule and tracking event in a shared knowledge base so your internal team can troubleshoot without waiting on external support. That kind of operational clarity compounds over time and keeps the next change from turning into another fire drill.

## Next Steps for Your DFW Business

If you are planning a platform shift or a full rebuild, do not guess at the routing. I will walk you through the exact migration steps, map your redirects and lock in your tracking before I touch production traffic. See what a migration project includes on [my services](/services) page. When you book a call I will put together a custom migration timeline, cost breakdown and risk assessment. I protect your rankings and your pipeline while you focus on selling.

Let’s get it done right. [Get started today](/contact) and I will start mapping your routes before the next quarter closes. I treat every migration like a revenue handoff, not a cosmetic refresh. Your baseline report will show whether the move held.
