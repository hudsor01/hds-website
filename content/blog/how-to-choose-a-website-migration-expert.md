---
title: 'How to Choose a Website Migration Expert'
slug: how-to-choose-a-website-migration-expert
excerpt: >-
  How to choose a website migration expert who keeps your rankings: what the job
  includes, questions to ask before you hire and the red flags that cost traffic.
targetKeyword: website migration expert
pillar: 6
tags:
  - website-migration
  - small-business
author: richard-hudson
publishedAt: '2027-01-05'
published: true
featured: false
featureImage: ''
readingTime: 0
---

A good website migration expert earns their fee on the pages you forgot you had. A bad move rarely crashes anything you can see. The new site looks great. It just quietly drops the calls and form fills the old URLs used to bring in. Nobody notices until the phone gets slower a month later.

You can run a move yourself. My [website migration checklist](/blog/website-migration-checklist) walks through every step. This post is for the other path: handing the move to someone else and knowing whether they're any good before you sign.

I spent nearly a decade in revenue operations working in Salesforce, HubSpot and Workato. The lesson from that work carries straight over to websites. You judge a system change by what still works the day after it goes live.

## What a Migration Expert Actually Does

Google publishes the playbook. [Google's site move guide](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes) lays out what a move with URL changes involves. Any expert you hire should be doing all of it.

**A full URL map.** Every old URL gets matched to its new URL before launch. The guide says to find old URLs in your sitemaps, analytics, server logs, CMS listings and Search Console's links report. Canonical tags, hreflang tags and internal links all get updated to point at the new addresses.

**Permanent redirects.** Each old URL should send visitors and Google straight to its new URL with a server-side permanent redirect, a 301 or a 308. Straight means one hop. Chains of redirects slow things down. Google's guide says to keep redirects in place generally for at least a year.

**Honest dead ends.** Some old pages have no equivalent on the new site. Google's guide says those should return a 404 or 410. It also says not to redirect lots of old URLs to one unrelated page such as the homepage.

**Search Console on both sides.** The old site and the new site both get verified in Search Console. The new sitemap gets submitted. Then someone watches the Sitemaps, indexing and queries reports as Google moves over.

**The links you control.** Your Facebook page, your LinkedIn profile, your other listings and your ad campaigns all point at old URLs. An expert updates the ones you control, points ads at the new landing pages and asks sites that link to you to update their links.

**Realistic expectations.** Google says ranking fluctuations are normal while it recrawls and reindexes a site. For a small to medium site, it says most pages take a few weeks to move. Anyone who tells you nothing will move in search during that window is guessing.

If you're keeping your URLs and only changing hosts, the job is smaller but still has traps. [Google's guide for moves without URL changes](https://developers.google.com/search/docs/crawling-indexing/site-move-no-url-changes) says to lower your DNS TTL at least a week in advance, keep Search Console verification working and leave the old host running until its traffic reaches zero.

Changing the domain itself adds one more step with its own risks to your email and your rankings. I covered that piece in [moving a domain without breaking email or rankings](/blog/how-to-transfer-your-domain-safely).

## Questions to Ask Before You Hire

Ask every provider the same questions. Write the answers down. Vague answers are an answer.

- Will you give me the full old-to-new URL map before launch?
- Which redirect type will you use and how long will the redirects stay up?
- How will you record my current rankings and traffic before the move?
- What is the rollback plan if forms or tracking break after launch?
- Who owns the domain, the hosting and every account when you're done?
- Will you use Google's Change of Address tool? Does my move qualify for it?
- What do you check in Search Console during the first few weeks?
- How do you handle old URLs that have no new page?

The ownership question deserves its own minute. If the answer involves the provider's account instead of yours, stop there. I explain what to check in [who should own your website and domain](/blog/who-owns-your-website-and-domain).

## Red Flags That Cost Traffic

Most bad migrations don't come from bad intent. They come from skipped steps. These are the ones I'd walk away over.

**No redirect map.** If they can't show you a spreadsheet of old URLs and new URLs before launch, they're planning to find out what broke after it.

**"We'll just point everything at the homepage."** It sounds tidy. Google's guide advises against redirecting many old URLs to one unrelated page like the homepage. Your old service pages earned their place in search. Send them somewhere that answers the same question.

**No baseline.** If nobody records your rankings, traffic and leads before the move, nobody can tell you afterward what changed. You'll be arguing from memory.

**No rollback plan.** Forms stop sending. Call tracking numbers disappear. Analytics goes quiet. Ask what happens in the first hour after launch if something breaks. "It won't" is not a plan.

**Everything at once.** A redesign, a new URL structure and a new domain all in one launch. Google's guide says to plan changes one after the other, not all at the same time. [Google's Change of Address documentation](https://support.google.com/webmasters/answer/9370220) warns that combining a move with a redesign or URL structure change can cause traffic loss.

**Not knowing the Change of Address rules.** That same documentation spells out when the tool applies. It's for moving a domain or subdomain. You use it after the redirects are live. It needs 301 redirects from the old homepage and both sites verified under one Google account. It doesn't apply to an HTTP to HTTPS switch, a www change, pages moving inside one site or a host-only move. It also says to keep the redirects up for at least 180 days and to keep the old domain for at least a year. A provider who has never heard of any of this is learning on your site.

**Accounts in their name.** The new domain registration, the hosting or the Search Console property sits in the provider's account. That's a lock you'll pay to open later.

**Guaranteed rankings.** Nobody controls how Google recrawls a site. Google itself says rankings can fluctuate during a move. A good expert tells you what they'll watch and how they'll respond, not where you'll land.

## Platform Moves Have Their Own Traps

Leaving an all-in-one platform adds problems a plain hosting move doesn't have. Each platform builds URLs its own way, stores your content its own way and sometimes holds the domain or the business listing in its own account. A migration expert should know the specific exit for the platform you're on.

If you're on Thryv, read about [leaving Thryv without losing local rankings](/blog/how-to-leave-thryv-without-losing-rankings) before you give notice. Wix has its own exit steps, which I cover in [moving off Wix](/blog/how-to-migrate-off-wix). Squarespace owners hit different limits, covered in [Squarespace to a custom site](/blog/squarespace-to-a-custom-site).

And if you're still deciding whether to move at all, start with [what monthly platform fees really cost](/blog/escaping-monthly-platform-fees). The migration only makes sense if the new setup beats what you're paying to stay.

## DIY or Hire?

Not every move needs an expert. Here's my honest split.

A small site with a few dozen URLs, a careful owner and a free weekend can be moved with the checklist. Make the URL map, set the redirects, verify both sites in Search Console, submit the sitemap and watch the reports for a few weeks. If you're organized, you can do this.

Hire it out when the site has years of URLs behind it, runs paid ads, takes bookings or payments, feeds leads into a CRM or ranks for terms that bring in real jobs. That's where one missed redirect or one broken form costs more than the help would have. Picture a Fort Worth roofing company with hundreds of old blog and city pages, an ad account and a booking widget. That move has too many moving parts for a weekend.

If the move comes with a rebuild, the new site is its own cost. [Estimate the website cost first](/blog/how-to-estimate-website-cost) so you know what the build should run on the market before anyone bundles it with the migration.

## How I'd Want You to Judge Me

Hold me to every question in this post. Ask me for the URL map. Ask me about the rollback plan. Ask me who owns the accounts when the work is done. If my answers aren't specific, hire someone else.

My [website migration services](/website-migration) page spells out what I include: a move to a site you own, your domain in your name, redirects from your old URLs and fresh sitemaps submitted to Google. Every project is priced on its own after a free 30-minute website plan call, once I know what you're moving and where it's going.

If you're weighing a move off a platform or an old host, [tell me what you're running today](/contact). I'll walk you through what the move involves for your site and which of these red flags to watch for, whoever ends up doing the work.
