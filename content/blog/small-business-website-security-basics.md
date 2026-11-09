---
title: Small Business Website Security Basics
slug: small-business-website-security-basics
excerpt: >-
  What really gets small business sites hacked and the short website security
  list that stops most of it: updates, MFA, least access and tested backups.
targetKeyword: website security
pillar: 10
tags:
  - web-development
  - small-business
author: richard-hudson
publishedAt: '2026-12-03'
published: true
featured: false
featureImage: ''
readingTime: 0
---

Most small business sites don't get hacked by a genius. They get hacked by a script that runs all night, checks millions of sites for one known hole and walks through every door nobody bothered to lock. Website security for a small business is mostly about not being the easy target. I spent nearly a decade in revenue operations running Salesforce and HubSpot, where one forgotten admin login could expose every customer record a company had. The same failure modes show up on a plumber's site in Mesquite or a med spa in Southlake. Different software. Same mistakes.

This post covers three things: what actually gets sites broken into, the short list that prevents most of it and who on your team should own it.

## What Actually Gets Small Business Sites Hacked

Nobody is targeting you personally. That's the good news and the bad news. Automated bots don't care whether you sell roofs in Frisco or tacos in Fort Worth. They care whether your site runs a version of something with a published vulnerability.

### Outdated plugins and themes

This is the big one. WordPress core is maintained by a serious team and gets patched quickly. Plugins are a different story. Plenty of small business WordPress sites run dozens of them, each written by a different developer with a different idea of how often to ship fixes.

Researchers who track WordPress vulnerabilities report the same pattern year after year: the large majority of new flaws turn up in plugins, not in core. Once a fix ships, the hole is public knowledge. Bots start scanning for unpatched sites within hours. If nobody clicked update, you're on the list.

Abandoned plugins are worse. The developer moved on, the plugin still works and nobody notices it hasn't seen an update in three years. Until it's the way in.

### Weak or shared logins

The whole office shares one admin login. The password is the business name plus the year it opened. It's on a sticky note at the front desk and the last three web people all had it.

Bots also run credential stuffing: they take email and password pairs leaked from other breaches and try them everywhere. If your office manager reused a password from some retail site that got breached, the bot may already have it.

### Abandoned admin accounts

The freelancer who built the site four years ago. The marketing agency you fired. The employee who left last spring. Every one of them may still have an admin account on your website.

In revenue operations, offboarding is basic hygiene. When someone leaves, their Salesforce access goes the same day, because a stale login is a data leak waiting to happen. Most small business websites have never had a single access review.

### No backups, or backups nobody has tested

Backups don't prevent a hack. They decide whether a hack costs you an afternoon or a month.

A lot of owners believe their host backs up the site. Sometimes it does, keeping a few days of copies on the same server that just got compromised. Sometimes the backup plan was a plugin that quietly stopped running after a failed update eight months ago.

## The Website Security List That Prevents Most of It

You don't need a security operations center. You need five habits done consistently.

### 1. Keep everything updated

Core, plugins, themes and the server's PHP or Node version. On WordPress, leave automatic updates on for minor releases and turn them on for plugins with a solid maintenance record. Then check once a month that they actually ran.

Delete every plugin you're not using. Deactivated isn't enough. The code is still sitting on the server.

### 2. Turn on multi-factor authentication everywhere that matters

Website admin. Hosting account. Domain registrar. The email inbox that receives password resets.

That last one is the one people skip. It's also the master key to all the others, because whoever controls the inbox can reset every password tied to it. Use an authenticator app over text message codes where you can. MFA shuts down most credential stuffing on its own since a stolen password isn't enough anymore.

### 3. Give people the least access they need

One login per person. No shared accounts. Your content writer needs editor access, not administrator. Your SEO contractor needs analytics and Search Console, not your hosting panel.

Once a quarter, pull the user list for the site, the host and the registrar. Remove anyone who doesn't currently work with you. It takes ten minutes. It also pairs well with knowing who controls those accounts in the first place, which my guide on [who owns your website and domain](/blog/who-owns-your-website-and-domain) walks through step by step.

### 4. Keep backups you have actually restored

The standard rule is 3-2-1: three copies of your data on two different types of storage, with one copy offsite. For a small business site that can be as simple as your host's backups plus a nightly copy to separate cloud storage that you control with a different login.

Then test it. Twice a year, restore a backup to a staging site and click around. Do the forms work? Are the images there? A backup you've never restored is a hope, not a plan.

### 5. Serve everything over HTTPS and set security headers

HTTPS is the floor. Chrome labels plain HTTP pages as not secure and now warns visitors before opening many of them. Any form that collects a name and phone number should never travel unencrypted. Many hosts issue free certificates now, so there's no reason to skip it.

Security headers are the half most people have never heard of. They're instructions your server sends the browser with every page:

- **Strict-Transport-Security** tells browsers to only load your site over HTTPS from then on, even if someone types the plain address.
- **Content-Security-Policy** lists which scripts are allowed to run, which blunts injected code.
- **X-Frame-Options** (or the CSP frame-ancestors rule) stops another site from loading yours inside its page to hijack clicks.
- **X-Content-Type-Options** stops browsers from guessing a file's type, which closes off a class of script injection tricks.

This site sets all of them in one file that runs on every request. On a typical WordPress host they're usually missing until someone adds them through the server config or a plugin.

## WordPress vs a Modern Framework

I'm not here to bash WordPress. It runs a huge share of the web. A well-run WordPress site with a handful of maintained plugins and someone watching updates can be perfectly safe.

The risk is the plugin-heavy pattern. Every feature becomes another piece of third-party code running on your server with access to your database. Updates depend on someone remembering to log in. Plugins sometimes conflict, so people stop updating to avoid breaking things. That's how a site drifts two years behind.

We build on Next.js because it changes the shape of the risk:

- There's no public `/wp-admin` login page for bots to hammer.
- Most pages are prebuilt and served from a global network, so there's no database query firing for every visitor.
- Contact forms post to code we wrote and review, not a plugin from a marketplace.
- Updates get tested in a preview build before they reach production instead of clicked live on the real site.

No stack gets a pass, though. Next.js projects have dependencies too and those need updating. A modern framework shrinks the attack surface. It doesn't remove the need for someone to own security. I go deeper on the tradeoffs in [why we build on Next.js, not WordPress](/blog/why-we-build-on-nextjs-not-wordpress).

## Who Should Own It

This is where most small businesses fall down. Everybody assumes someone else has it handled.

The owner thinks the web designer handles it. The designer thinks the host handles it. Many hosting terms of service say plainly that the software you install is your responsibility. So nobody does it.

Pick one name. Your realistic options:

- **You or your office manager**, if the site is simple and you'll actually run the monthly check below. Put it on the calendar like payroll.
- **Your web developer on a maintenance plan**, if you'd rather hand it off. Get it in writing: what gets updated, how often, where backups live and how fast they respond when something breaks. My breakdown of [website maintenance costs](/blog/website-maintenance-costs-explained) covers what a fair plan should include.

The third option is nobody. It's the default. It's also the one that ends with your site redirecting customers to a spam page while you find out from a confused caller.

Whoever does the work, the business owner keeps the master keys: the domain registrar login, the hosting account and the email that controls password resets. Contractors get their own accounts that you can shut off in one click.

One more reason to take this seriously. If your site or forms store sensitive personal information and it leaks, Texas has a breach notification law with real deadlines for telling the people affected. Cleanup is the cheap part.

## A Monthly Check That Takes 20 Minutes

Run this the first business day of every month:

1. Confirm updates ran on core, plugins and themes.
2. Remove unused plugins and any user account that shouldn't be there.
3. Check that the newest backup is from the last day or two and lives somewhere other than the web server.
4. Load your site on your phone in a private window. Look for odd redirects, pop-ups or pages you didn't create.
5. Open the Security Issues report in Google Search Console. Google flags hacked content it finds there.
6. Glance at renewal dates for the domain and hosting so nothing lapses.

That's it. Twenty minutes a month beats a week of cleanup and a phone call to your customers.

## Where to Start This Week

Don't try to fix everything on a Tuesday afternoon. Do it in this order.

Today, turn on MFA for the email that receives password resets and for your domain registrar. Those two protect everything else.

This week, pull the admin user list and delete everyone who doesn't need to be there. Then find out where your backups actually live.

This month, restore one backup to a test site so you know it works.

If you look at your setup and find a site nobody has touched in two years with forty plugins and five admins you don't recognize, it may be cheaper to rebuild than to patch. Run the numbers with the [website cost estimator](/tools/cost-estimator) before you decide. If you'd rather have someone look at it with you, [send me a note](/contact) and I'll walk through your site, your logins and your backups and tell you what I'd fix first.
