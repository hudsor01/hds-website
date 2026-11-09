---
title: How to Show Up in AI Search Results
slug: how-to-show-up-in-ai-search
excerpt: >-
  How small businesses get cited in ChatGPT, Google AI Overviews and Perplexity:
  clear business facts, schema, answer-first pages and local mentions.
targetKeyword: ai search
pillar: 3
tags:
  - seo
  - local-marketing
  - small-business
author: richard-hudson
publishedAt: '2026-11-12'
published: true
featured: false
featureImage: ''
readingTime: 0
---

Somebody in Frisco types "who fixes garage doors near me on a Sunday" into ChatGPT. They get three names back. No ten blue links, no map pack, no ads to scroll past. Just three businesses and a sentence about each. If you are not one of the three, you never had a shot. That is AI search. People already use it to pick local businesses the same way they used to scroll Google. The businesses getting named are not doing anything mysterious. They do the basics so cleanly that a machine can repeat their facts with confidence.

I spent nearly a decade in revenue operations working in Salesforce, HubSpot and Power BI. The lesson that carried over: systems trust clean data. A CRM with three phone numbers for one account produces garbage reports. An AI model reading three versions of your business produces no answer, or the wrong one.

## What AI Search Actually Reads

First, know where the answers come from. There is no single "AI index" you submit to.

**Google AI Overviews and AI Mode** pull from Google's regular search index. Google has said plainly that there is no special markup or trick for them. If your page is indexed and eligible to show a snippet in normal results, it can be used. If it is not, it can't.

**ChatGPT search** runs its own crawler, OpenAI's OAI-SearchBot. It also draws on third-party search results. If your robots.txt blocks that crawler, you have opted out of being cited in ChatGPT's search answers.

**Perplexity** crawls with its own bot too, then cites the pages it pulled from right in the answer.

**Microsoft Copilot** leans on Bing's index, which many owners have never checked.

So the real job has two halves. First, be crawlable and indexed everywhere these tools look. Second, make your facts so clear and so consistent that a model picks you up without hesitation.

### Check you are not blocking the bots

This takes five minutes. Pull up yoursite.com/robots.txt. If you see `Disallow: /` under OAI-SearchBot or PerplexityBot, someone made that choice for you, sometimes a security plugin or a hosting default.

Don't confuse this with Google-Extended. That is a separate token that controls whether Google can use your content to train Gemini models. Blocking it does not remove you from AI Overviews. Decide what you actually want, then set it on purpose.

While you are there, set up Bing Webmaster Tools. It is free and covers the index behind Copilot.

## Make Your Business Facts Impossible to Misread

AI models are pattern matchers. When they see the same name, address, phone number, hours and service list repeated across your site, your Google Business Profile, Yelp, the BBB and the Plano Chamber directory, they treat it as settled. When the facts disagree, they hedge or skip you.

This is the same problem I wrote about in [NAP consistency and local SEO](/blog/nap-consistency-local-seo), with higher stakes. A traditional search engine can still rank you with a messy citation profile. A model writing a one-paragraph answer has to commit to a single phone number. If it cannot tell which one is right, the easier move is to name your competitor.

Here is the minimum I want to see on every local service site:

- Your business name exactly as it appears on your Google Business Profile, written the same way everywhere
- A real street address or a clearly stated service area, never both contradicting each other
- One primary phone number, in the footer of every page
- Hours that match your profile, including holiday changes
- A plain list of the cities you serve, written as text, not buried in an image of a map

That last one matters more than people expect. "We serve Dallas, Plano, Frisco, McKinney, Allen and Richardson" is a sentence a model can quote. A pretty graphic of a shaded county map is invisible to it.

### Your Google Business Profile is a source, not a listing

Treat the profile like a page you publish. Fill every field. Pick the most specific primary category Google offers. Write the description in plain language that says what you do and where. Post updates. My [Google Business Profile optimization checklist](/blog/google-business-profile-optimization-checklist) walks through each field in order. Google's local results are built on this data, so a thin profile gives every answer engine less to work with.

## Structured Data Tells the Machine What It Is Looking At

Schema markup is the closest thing you have to talking directly to these systems. It is a block of code on your page that says, in a format machines parse instantly, "this is a plumbing business, here is its address, here are its hours, here is its phone number, here are the areas it serves."

It does not guarantee a citation. Nothing does. What it does is remove ambiguity. Ambiguity is what gets you skipped. If you are new to the concept, start with my [practical guide to structured data](/blog/structured-data-and-schema-guide). For the specific markup a local shop needs, read [how LocalBusiness schema helps Google find you](/blog/localbusiness-schema-help-google-find-you).

The short version for most service businesses:

- **LocalBusiness** (or a more specific subtype like Plumber, Dentist or HVACBusiness) on your home page and contact page
- **Service** markup on each core service page
- **FAQPage** markup only where the page really has a visible FAQ section

The rule that trips people up: the markup must match what is visible on the page. If your schema says you open at 7 a.m. and your page says 8 a.m., you just created the exact contradiction you were trying to fix.

You don't need a developer to get started. Our free [schema generator](/tools/schema-generator) builds valid LocalBusiness JSON-LD from a short form. Paste it into your site's head, then confirm it with Google's Rich Results Test.

## Write Pages That Answer First

AI answers get built from passages, not whole pages. A model looking for "how much does a water heater replacement cost in Fort Worth" wants a clear sentence it can lift. If your page spends four paragraphs on your company's founding story before mentioning price, the model moves on to a page that gets to the point.

So I write service pages like this. The question is the heading. The direct answer is the first sentence under it. Then the detail, the caveats and the reasons. A homeowner on a phone gets the answer in five seconds. A model gets a clean passage to cite.

Three habits I hold every page to:

- **Use the words customers use.** "AC not blowing cold air" beats "HVAC system performance diagnostics."
- **Give ranges when you can.** A real range with the factors that move it is more useful than "call for a quote." You don't have to commit to a number you can't stand behind.
- **Name the place.** "We replace roofs in Southlake and Keller" tells a model where you work. "We serve the area" tells it nothing.

### The questions you already get are the content plan

Every question your front desk answers by phone is a section waiting to be written. Do you service Rockwall? Do you charge for estimates? Write those answers on your site in plain language. That is the content AI search wants most.

## Reviews and Mentions Are the Trust Layer

Models don't just repeat what you say about yourself. They weigh what others say about you.

Reviews are the first piece. Volume matters, recency matters and the actual words in reviews matter. A review that says "they fixed our AC in Arlington the same afternoon" carries a city, a service and a speed claim a model can pick up. You can't script reviews, but you can ask consistently and make it easy. I covered the mechanics in [how to get more Google reviews](/blog/how-to-get-more-google-reviews).

The second piece is mentions on sites the models already trust. For a DFW business that means things like:

- Your local chamber of commerce member directory
- Trade association listings for your industry
- Local news coverage, even a short quote in a neighborhood story
- Supplier or manufacturer "find a dealer" pages

A link is nice but not the point. A mention of your business name next to your city and your service, on a page a model already considers reliable, reinforces everything else.

## What Nobody Fully Controls

I want to be straight with you about this part, because plenty of people are selling certainty they don't have.

You cannot pay to be named in a ChatGPT answer. You cannot submit your site to Perplexity and get guaranteed placement. Answers vary by how the question is worded, by the user's location and from one day to the next. Ask the same question twice and you may get two different lists.

Measurement is also rough. Google Search Console now has a Generative AI report that counts how often your pages show up in AI Overviews and AI Mode, but it shows impressions only, not clicks. ChatGPT and Perplexity referrals show up in analytics as referral traffic when someone clicks through, but plenty of people read the answer and call you directly without ever clicking. That is why I tell every owner to add a "how did you hear about us" field to their intake form with "ChatGPT or AI tool" as an option. It is low-tech and it is the most honest signal you will get right now.

I also skip the trendy stuff. My test for any new "AI visibility" trick: has the company running the engine said it uses this? If not, that hour goes to clearer service pages.

The upside is that everything above also improves regular search. Clean business facts, solid schema, answer-first pages and real reviews help you in regular Google results and the map pack today. If AI search keeps growing, you are ready. If it stalls, you still won.

## Where to Start This Week

If you only have an hour, do this in order:

1. Open your robots.txt and make sure you are not blocking the search crawlers you want
2. Compare your name, address, phone and hours across your site and your Google Business Profile, then fix any mismatch
3. Run your home page through Google's Rich Results Test and see if any LocalBusiness markup shows up
4. Rewrite the first sentence of your top service page so it directly answers the question a customer would ask

That hour puts you ahead of every competitor who hasn't done it.

If you would rather have someone audit the whole picture, from crawl access to schema to how your service pages read to a machine, [get in touch](/contact). I'll tell you what's actually holding you back and what isn't worth your money.
