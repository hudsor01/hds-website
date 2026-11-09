---
title: 'Google Analytics 4 for Small Business: What Matters'
slug: google-analytics-4-for-small-business
excerpt: >-
  Skip the vanity metrics. The GA4 key events, reports and settings a service
  business needs to see which pages and channels bring in calls and forms.
targetKeyword: google analytics 4
pillar: 4
tags:
  - conversion-optimization
  - small-business
author: richard-hudson
publishedAt: '2026-12-01'
published: true
featured: false
featureImage: ''
readingTime: 0
---

Most small businesses I talk to have Google Analytics 4 installed. Almost none of them use it. Somebody pasted the tag in at launch. The owner logged in once, saw a wall of charts about users and sessions, then closed the tab for good. That's a shame, because a plumber in Arlington or a med spa in Southlake doesn't need most of what GA4 offers. You need about five setups and three reports. Get those right and the tool answers the only question that matters: which pages and channels are making the phone ring?

I spent nearly a decade in revenue operations, living in Salesforce, HubSpot and Power BI. The lesson that carried over to websites is simple. A report is only worth opening if it changes what you do next week. Everything below passes that test.

## What Google Analytics 4 Should Answer for a Service Business

Before touching a single setting, write down the questions you want answered. For a service business they're almost always the same:

- How many people called or filled out a form this month?
- Where did those people come from?
- Which pages did they land on first?
- What did they search on Google to find me?

That's the whole list. Notice what's missing. Total users. Pageviews. Average engagement time. Those numbers go up and down for reasons that have nothing to do with revenue. Chasing them is how owners end up paying for traffic that never books a job. If you've ever stared at a healthy visitor count while the calendar sat empty, I wrote about that exact problem in [traffic but no leads](/blog/website-traffic-but-no-leads).

## Set Up Key Events Before You Read Anything

GA4 renamed "conversions" to **key events** in 2024. Same idea, new label. A key event is any action you've flagged as valuable. Without key events, GA4 can tell you how many people showed up. It can't tell you how many became leads.

For a service business, two key events cover most of the value.

### Form submissions

Enhanced measurement has a form interaction setting that tries to detect form submits on its own. Don't trust it. It can miss forms that submit through JavaScript without reloading the page, which is how a lot of modern contact forms work. It can also count a submit attempt that never actually went through.

The reliable options:

1. **Thank-you page.** Send people to a dedicated page like `/thank-you` after they submit, then create a key event that fires when that page loads. Simple and hard to break.
2. **Custom event.** Have your developer fire an event named `generate_lead` (one of Google's recommended event names) when the form actually succeeds. This is the option I prefer, because it only fires after the server confirms the submission went through.

Either way, submit a test form yourself and check the Realtime report to confirm the event shows up. A "lead" event that fires on page load, or never fires at all, is an easy mistake to miss. Skip the test and you end up making decisions on numbers that are simply wrong.

If the form itself is the weak link, start with [lead capture forms that convert](/blog/lead-capture-forms-that-convert) before worrying about measurement.

### Phone taps

On mobile, a lot of service leads never touch a form. They tap your number. GA4 doesn't treat a tap on a `tel:` link as a key event out of the box, so set up a custom event for it, usually through Google Tag Manager with a trigger on clicks where the link starts with `tel:`.

Be honest about what this measures. A tap is intent, not a completed call. Someone can tap, see the dialer and hang up. If phone calls are most of your revenue, a call tracking service that assigns numbers by source will give you the real count. For most small shops, though, tap tracking is close enough to show which pages drive calls.

### Mark them as key events

Once the events exist, go to Admin, then Events (under Data display). Mark `generate_lead` and your phone event as key events. A brand-new event can take up to a day to appear in that list, so give it time. That's it. From then on, those numbers show up as columns in nearly every report.

## Filter Out Your Own Traffic

This one takes ten minutes and almost nobody does it.

Every time you check your own site, test a form or pull up your pricing page to send a link, GA4 counts it. Your office manager does the same. In a small business with modest traffic, internal visits can make up a real share of your data. Worse, your own test submissions inflate your lead count.

The fix has two steps:

1. In Admin, open Data streams, select your web stream, open Configure tag settings, then **Define internal traffic**. Add a rule with your office IP address.
2. In Admin, open Data collection and modification, then **Data filters**. You'll find an Internal Traffic filter that GA4 created for you. It starts in Testing state, which means it labels the traffic but doesn't remove it. Switch it to **Active**.

Two caveats. Filters aren't retroactive. And home internet IP addresses can change, so if you work from home in McKinney or Fort Worth, recheck your IP every few months.

## Connect Search Console

Google Search Console shows what people typed into Google before they clicked your site. GA4 shows what they did once they arrived. Linking the two puts both halves of the story in one place.

In GA4, go to Admin, then Product links, then **Search Console links**. Follow the prompts. You need to be a verified owner of the Search Console property to finish. Then open the Library at the bottom of the Reports section and publish the Search Console collection, because it doesn't appear in your navigation by default.

Now you can see which search queries bring visitors to which landing pages. If "emergency AC repair Plano" sends you traffic to a generic services page, that's a sign you need a page built for that search. If you're working on rankings across several suburbs, [ranking in multiple cities](/blog/how-to-rank-in-multiple-cities) covers how to structure those pages.

## The Three Reports I Actually Open

### Traffic acquisition

Reports, then Acquisition, then **Traffic acquisition**. This breaks sessions down by channel: Organic Search, Direct, Paid Search, Organic Social, Referral and so on.

Ignore the sessions column at first. Find the key events column, pick your lead event from the dropdown and sort by it. Now you're looking at which channels produce leads, not which produce visits. Plenty of owners discover that the channel with the most traffic isn't the one sending calls.

### Landing page

Reports, then Engagement, then **Landing page**. This shows the first page each session started on.

Again, sort by key events. Your best landing pages are the ones that turn visitors into leads at a decent rate, not the ones with the most traffic. A page with heavy traffic and zero key events is a page worth fixing. Usually the offer is vague or the call to action is buried. My checklist for that lives in [landing page optimization for small business](/blog/landing-page-optimization-small-business).

### Search Console queries

Once the Search Console collection is published, the **Queries** report shows the Google searches that bring people in, along with clicks, impressions and average position. I look for queries with lots of impressions but few clicks. Those are spots where you already show up and a better title or a dedicated page could pull more of that traffic.

## Two Settings Nobody Changes

**Data retention.** By default GA4 keeps event-level data for just two months, which limits how far back the Explore reports can go. Go to Admin, then Data collection and modification, then Data retention. Change it to 14 months, the longest a standard GA4 property allows. Standard reports aren't affected, but you'll want that history the first time you compare this spring to last spring.

**Unwanted referrals.** If customers leave your site to pay through Stripe, book through a scheduling tool or log into a portal, GA4 can credit the lead to that tool instead of the channel that actually sent them. Add those domains under List unwanted referrals in your tag settings so the original source keeps the credit.

## The Metrics I Ignore

I'm not against data. I built forecasting models for a living. But a metric has to connect to money or I don't look at it.

- **Total users.** Up 20% means nothing if leads are flat.
- **Pageviews.** A visitor clicking through six pages because they can't find your phone number is a failure that looks like success.
- **Average engagement time.** Long time on a contact page might mean the form is confusing.
- **Bounce rate.** GA4 brought it back as the opposite of engagement rate. On a service site, someone who lands, sees your number and calls you just "bounced." That's the best possible visit.

If you want a broader view of measuring a site, including speed and Core Web Vitals, see [how to measure website performance](/blog/how-to-measure-website-performance).

## A 15-Minute Monthly Routine

Here's the routine I'd give any owner in Frisco or Grapevine who wants to stay on top of this without becoming an analyst:

1. Open Traffic acquisition. Note leads by channel. Compare to last month.
2. Open Landing page. Find the page with the most traffic and the fewest key events. That's your one fix for the month.
3. Open Search Console Queries. Find one high-impression query you're not built for. That's your next page.
4. Submit one test form and tap your phone number on your own phone. Confirm both still register in Realtime.

Write the numbers in a spreadsheet. After six months you'll know your real cost per lead by channel, which tells you where your next marketing dollar should go. Plug those numbers into the free [ROI calculator](/tools/roi-calculator) to see what a small lift in your conversion rate is worth in actual revenue.

## Get It Set Up Once, Correctly

Google Analytics 4 isn't hard. It's just noisy. The defaults are tuned for big sites with big teams. A service business needs a short list of things done right: real key events, clean data, Search Console linked and three reports read every month.

This is the kind of setup I'd rather do once, correctly, with tested lead and phone events tied to the forms and buttons that matter. If your current setup is a tag someone pasted in years ago and you've never trusted the numbers, [get in touch](/contact) and I'll tell you what's tracking, what's broken and what it would take to fix it.
