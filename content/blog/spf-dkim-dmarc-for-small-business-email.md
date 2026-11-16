---
title: 'SPF DKIM DMARC: Why Your Invoices Land in Spam'
slug: spf-dkim-dmarc-for-small-business-email
excerpt: >-
  Quotes and invoices landing in spam? Here is what SPF, DKIM and DMARC do in
  plain English, how to check yours and the safe order to roll them out.
targetKeyword: spf dkim dmarc
pillar: 10
tags:
  - web-development
  - small-business
author: richard-hudson
publishedAt: '2026-11-19'
published: true
featured: false
featureImage: ''
readingTime: 0
---

Your quote went out Tuesday. The customer swears they never got it. They did. It's sitting in their spam folder next to a fake shipping notice, because your domain never told Gmail it was allowed to send that email. The fix is an SPF DKIM DMARC setup: three DNS records most small businesses either never set up or set up halfway. I spent nearly a decade in revenue operations working in HubSpot and Salesforce. Sending email from a company domain through either one doesn't start with templates or sequences. It starts with DNS. Get these three records right and your invoices, quotes and follow-ups start landing where they belong.

## Why Your Email Lands in Spam

Gmail, Outlook and Yahoo are flooded with forged email. Anyone can type your business name into the "From" line of a message. Nothing in the original email protocol stops them. So the providers ask a simple question before delivering a message: can this sender prove it's allowed to use this domain?

If the answer is "no" or "can't tell," your message lands in spam or gets rejected outright. Nobody tells you.

This hurts a service business more than people think. Picture a roofer in Arlington sending a storm repair quote through his invoicing app. The app sends "from" his domain, but his DNS has never heard of that app. The homeowner's inbox sees a mismatch and buries the quote. A competitor in Mansfield calls the homeowner the next morning and wins the job. The roofer never finds out why.

The fix lives in your domain's DNS settings, the same place your website and email records live. If you're not sure who controls that, read [who owns your website and domain](/blog/who-owns-your-website-and-domain) first. You can't fix records you can't log into.

## What SPF, DKIM and DMARC Each Do

Three records, three different questions.

### SPF: who is allowed to send

SPF (Sender Policy Framework) is a single TXT record on your domain that lists the services allowed to send mail for you. It looks like this:

```
v=spf1 include:_spf.google.com include:spf.protection.outlook.com ~all
```

Each `include:` names a sender. Google Workspace uses `_spf.google.com`. Microsoft 365 uses `spf.protection.outlook.com`. Your CRM, your invoicing tool or your website's form service may each need their own entry. The `~all` at the end says "anything not on this list is suspicious." The stricter `-all` says "reject anything not on this list."

Two gotchas catch almost everyone:

- **One SPF record per domain.** If you have two TXT records that start with `v=spf1`, receiving servers treat it as a permanent error and SPF fails. Merge them into one.
- **Ten DNS lookups, max.** Every `include:` costs at least one lookup. Some providers nest more inside theirs. Go over ten and SPF breaks. Stacking every tool you've ever tried is how small businesses hit this limit.

SPF also has a blind spot. It checks the hidden "envelope" sender address, not the "From" address your customer actually sees. That's why SPF alone isn't enough.

### DKIM: proof the message wasn't forged

DKIM (DomainKeys Identified Mail) adds a digital signature to every email you send. Your provider signs each message with a private key it keeps. You publish the matching public key in DNS, usually at an address like `google._domainkey.yourdomain.com`. The receiving server checks the signature against that key. A match proves an authorized sender sent it and nobody altered it in transit.

Most providers generate the key for you. Google Workspace has an "Authenticate email" screen in the Gmail admin settings that hands you a TXT record to paste into DNS. Microsoft 365 gives you two CNAME records instead. Plenty of other platforms work the same way. The CNAMEs point to keys the provider manages for you. Either way, you copy what they give you, paste it into DNS and click verify.

Every service that sends as your domain needs its own DKIM setup. Your Workspace inbox being signed does nothing for the emails your booking software sends.

### DMARC: the policy that ties it together

DMARC (Domain-based Message Authentication, Reporting and Conformance) is the record that tells inbox providers what to do when a message fails. It lives at `_dmarc.yourdomain.com` and looks like this:

```
v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
```

DMARC does two things SPF and DKIM can't do alone.

First, it checks **alignment**. A message passes DMARC only if SPF or DKIM passes for a domain that matches the "From" address your customer sees. That closes the blind spot. A spammer can pass SPF for their own domain all day, but it won't line up with yours.

Second, it sends you **reports**. The `rua` address receives aggregate reports, usually daily, from the big inbox providers showing every server that sent email claiming to be you. That's how you find the forgotten tool still sending invoices from an old account.

The `p=` tag is the policy. `none` means monitor only. `quarantine` means send failures to spam. `reject` means block them entirely.

## The 2024 Gmail and Yahoo Rules

In February 2024, Google and Yahoo started enforcing new sender requirements. These rules are why plenty of businesses that never thought about DNS suddenly saw delivery problems.

The short version:

- **Every sender** needs SPF or DKIM, valid DNS for its sending servers and a low spam complaint rate.
- **Bulk senders**, which Google defines as sending close to 5,000 or more messages a day to personal Gmail accounts, need SPF and DKIM and a DMARC record. The "From" domain has to align with one of them. Marketing email needs a one-click unsubscribe.

Most DFW service businesses aren't bulk senders. But "every sender" still applies to you. If your quotes and invoices go out with no authentication at all, Gmail has every reason to distrust them. Microsoft followed in 2025 with similar rules for high-volume senders to Outlook.com consumer inboxes. The direction is obvious: unauthenticated email is on its way out.

You don't need bulk volume for this to bite. A newsletter, appointment reminders and automated follow-ups all go out under your domain. Every one of them gets judged on the same records. If you're building any of that, like the setups in [automating customer follow-up with email and SMS](/blog/automate-customer-follow-up-email-sms), authentication is step zero.

## How to Run an SPF DKIM DMARC Check on Your Domain

You can check where you stand in about five minutes.

**Option 1: Look at a real email.** Send a message from your business address to a personal Gmail account. Open it, click the three-dot menu and choose "Show original." Gmail lists SPF, DKIM and DMARC at the top with PASS, FAIL or nothing. Do this for every tool that sends as you: your inbox, your invoicing app, your CRM, your website contact form.

**Option 2: Look up the records.** Free lookup tools like MXToolbox will show your SPF and DMARC records and flag syntax errors. If you're comfortable in a terminal:

```
dig TXT yourdomain.com
dig TXT _dmarc.yourdomain.com
```

Here's what bad results usually look like:

- No SPF record, or two of them
- DKIM passes for your inbox but fails or is missing for your invoicing tool
- No DMARC record at all
- DKIM passes, but for the vendor's domain instead of yours, so it doesn't align

That last one is common. Many tools sign mail with their own domain by default. It passes DKIM technically, but it doesn't help your DMARC. Look for a "custom domain," "domain authentication" or "sender domain" setting in the tool and turn it on.

## The Safe Rollout Order

The most expensive mistake is jumping straight to `p=reject` after reading a scary article. That can block your own legitimate email overnight, including the invoices you're trying to save. Go in this order.

### 1. Inventory every sender

List every service that sends email as your domain. Inbox provider, invoicing, CRM, booking, payment receipts, website forms, newsletter. If you create quotes or invoices with a tool like my free [invoice generator](/tools/invoice-generator) and email them from your own inbox, that's covered by your inbox provider. If an app sends them for you, that app goes on the list.

### 2. Publish one clean SPF record

Combine every sender's `include:` into a single record. Count your lookups. If you're over ten, drop tools you no longer use or move a high-volume sender to a subdomain like `mail.yourdomain.com` with its own records.

### 3. Turn on DKIM for each sender

Work through the list one tool at a time. Publish the records each one gives you, verify inside the tool, then confirm with "Show original" that DKIM passes for your domain.

### 4. Publish DMARC at p=none

Start with monitoring only:

```
v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
```

Nothing gets blocked. You just start receiving reports. The raw reports are XML files that no human should read by hand, so point them at a free DMARC report service that turns them into a readable dashboard. Use an address on your own domain for `rua`, or a dedicated mailbox from the report service.

### 5. Read the reports for a few weeks

This is where the operator work happens. Look for legitimate senders failing alignment and fix them. Look for sources you don't recognize. Some will be forgotten tools. Some will be spoofers. Two to four weeks of clean data is usually enough for a small business.

### 6. Tighten to quarantine, then reject

Move to `p=quarantine` once your legitimate mail passes consistently. When quarantine runs clean, move to `p=reject`. At that point Gmail, Yahoo, Outlook and any other provider that honors DMARC will block or junk mail that forges your exact domain.

Keep the reports running after you hit reject. Every new tool you add later needs SPF and DKIM before it sends a single message, or DMARC will block it. That's the system working as designed.

## Where This Fits in Your Stack

Email authentication isn't glamorous. But it sits under every revenue process that touches an inbox: quotes, invoices, booking confirmations, review requests, password resets. A great follow-up sequence is worthless if Gmail hides it. For the website itself, start with [the security basics that stop most small business site hacks](/blog/small-business-website-security-basics).

It also matters any time you change providers or move your domain. Records get dropped during migrations all the time, which is why it's on the checklist in [how to transfer your domain safely](/blog/how-to-transfer-your-domain-safely).

If you're planning a new site or a migration, put email authentication in the scope: the contact form and every connected tool get SPF and DKIM before launch, then DMARC walks up to reject once the reports are clean. If your quotes keep disappearing and you'd rather have someone else sort out the DNS, [get in touch](/contact) and I'll take a look at your records.
