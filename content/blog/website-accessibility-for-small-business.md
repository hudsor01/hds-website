---
title: 'Website Accessibility for Small Business: What to Check'
slug: website-accessibility-for-small-business
excerpt: >-
  Website accessibility keeps customers, lowers ADA risk and helps SEO. Here is
  the 20-minute check I run and why overlay widgets do not fix it.
targetKeyword: website accessibility
pillar: 1
tags:
  - web-design
  - small-business
author: richard-hudson
publishedAt: '2026-11-17'
published: true
featured: false
featureImage: ''
readingTime: 0
---

Most small business owners think about website accessibility once: the day a demand letter shows up. That's the wrong order. Accessibility is a customer problem first, a search problem second and a legal problem third. If someone can't read your service list, tab to your booking button or submit your quote form, you lost that job before you ever knew it existed. No analytics dashboard flags it. The visitor just leaves.

I spent nearly a decade in revenue operations before I built websites. In that work, a lead that dropped out of the funnel for a fixable reason was the most expensive kind of lead. An inaccessible site produces exactly that kind of loss, quietly, every day.

This post covers why it matters, the checks you can run yourself in about 20 minutes and why the widget your web host keeps pitching won't solve it. I'm not a lawyer and none of this is legal advice. It's an operator's view of what to fix.

## Why Website Accessibility Is a Revenue Issue

Think about who visits a plumber's site in Plano or a med spa in Southlake. Some of them are older and zoom their browser to 200% because the default text is too small. Some are colorblind. Some have a tremor and use the keyboard instead of a mouse. Some are blind and use a screen reader that reads the page out loud. Plenty are just standing in a bright parking lot squinting at a phone with the brightness down.

Every one of those people is a potential customer with money to spend. When your site fights them, they call the next company on the list.

The fixes that help a screen reader user also help everyone else. Clear headings make a page easier to scan. Strong contrast makes text readable in the sun. Labeled form fields cut down on wrong entries. Bigger tap targets mean fewer missed taps on a phone. Accessibility work and conversion work overlap heavily, which is why I fold it into every build instead of treating it as a separate line item.

### The SEO Overlap

Search engines read alt text to understand your images. A transcript on the page gives them text to work with for a video. Your headings also give them clues about what a page is about. That's the same structure a screen reader uses to jump around the page.

Accessibility isn't a direct ranking factor in any simple sense. But the things that make a page accessible are the same things that make it understandable to a search engine. Clean structure is good structure, for both audiences. If you've read my breakdown of [Core Web Vitals for small business](/blog/core-web-vitals-explained-for-small-business), this is the same idea: build the page well and you make the search engine's job easier.

## The Legal Picture, Without the Panic

The Americans with Disabilities Act was written before the modern web existed, so it doesn't mention websites by name. Title III covers businesses open to the public, called places of public accommodation. The Department of Justice has taken the position that the websites of those businesses are covered. Courts haven't all agreed on how far that reaches, especially for businesses that operate only online.

What matters for you in practice:

- There's no specific technical standard written into the ADA for private business websites. The DOJ did adopt WCAG 2.1 Level AA as the standard for state and local government sites, so that version is the practical benchmark most people work from.
- Website accessibility lawsuits and demand letters are common. Small businesses get them, not only national chains.
- A lot of those claims target sites with obvious, easy-to-find problems. Missing alt text and unlabeled forms show up in automated scans in seconds.

I'm not telling you this to scare you. I'm telling you because the cheapest defense is a site that actually works for people. If you get a letter, talk to a lawyer. Before that happens, fix the obvious stuff.

## What WCAG Actually Is

WCAG stands for Web Content Accessibility Guidelines. It's published by the W3C, the group that sets web standards. The current version is 2.2, which builds on 2.1 and adds several new success criteria. It's organized around four principles. People have to be able to perceive the content, operate the controls and understand what they're reading. The code also has to hold up across browsers and assistive technology like screen readers.

You don't need to read the whole spec. Level AA is the target most businesses aim for. The checks below cover the failures I see most often on small business sites around DFW.

## The 20-Minute Accessibility Check

Grab a laptop and open your homepage, your main service page and your contact page. Work through these in order.

### 1. Alt Text on Images (4 minutes)

Every meaningful image needs alt text that describes what it shows. A photo of your crew installing a water heater should say that. "IMG_4471.jpg" or "image" doesn't count.

Purely decorative images, like a background texture, should have empty alt text so screen readers skip them. Your logo's alt text should be your business name.

How to check: right-click an image and choose Inspect. Look for `alt=` in the highlighted code. If it's missing or says something useless, that's a fix.

### 2. Color Contrast (4 minutes)

Light gray text on a white background looks sleek in a mockup and fails real people. WCAG AA asks for a contrast ratio of at least 4.5 to 1 for normal body text and 3 to 1 for large text.

How to check: search for a free contrast checker, then plug in your text color and background color. Pay extra attention to text placed over photos, button labels and the small print in your footer. Those are where contrast usually fails.

### 3. Keyboard Navigation (5 minutes)

This is the test that tells you the most. Click in the address bar, then put your mouse away. Press Tab over and over to move through the page. Shift+Tab goes backward. Enter activates links and buttons.

Ask yourself:

- Can you always see where you are? There should be a visible outline or highlight on the focused item.
- Can you reach the menu, the phone number, the booking button and every form field?
- Does a popup or chat widget trap you so you can't Tab out of it?
- Can you open and close the mobile menu without a mouse?

If you get stuck anywhere, so does every keyboard user. This one exposes a lot of drag-and-drop builder templates. I covered more of those layout traps in [web design mistakes that cost customers](/blog/web-design-mistakes-that-cost-customers).

### 4. Form Labels (4 minutes)

Your contact form is where money changes hands, so check it carefully. Every field needs a real label that stays visible. Placeholder text that disappears when you start typing is not a label. Screen readers may not announce it and sighted users forget what the field was for.

Also submit the form empty on purpose. Do the error messages say which field is wrong and how to fix it? Or does the box just turn red? Color alone doesn't help someone who can't see red. If your forms need work anyway, my guide to [lead capture forms that convert](/blog/lead-capture-forms-that-convert) pairs well with this step.

### 5. Captions and Media (3 minutes)

If you have a video on your homepage, it needs captions. Auto-generated captions are a starting point, not a finish line, because they mangle names, street names and trade terms constantly. Watch them once and correct the errors.

Also check for anything that autoplays with sound or moves on its own for more than a few seconds. Sliders and carousels should have a pause control. Honestly, most of them should just be removed.

### Bonus: Zoom to 200%

Press Ctrl and the plus key (Cmd and plus on a Mac) until your browser is at 200%. Does the text still fit? Does anything overlap or disappear off the side? A site built mobile first usually passes this one easily, which is one more reason I push [mobile-first web design](/blog/mobile-first-web-design-for-service-businesses) on every project.

## Why Overlay Widgets Are Not the Fix

You've probably seen the pitch. Paste one line of code, a little accessibility icon appears in the corner and the vendor promises compliance. It sounds perfect for a busy owner. It isn't.

Overlays sit on top of your existing code and try to patch problems on the fly. They can't reliably write accurate alt text for a photo of your specific work. They can't fix a form that was built without labels in the underlying code. They can't untangle a menu that traps keyboard users. The broken site is still there underneath.

A lot of blind users and accessibility professionals actively dislike these tools because they can interfere with the screen readers people already have set up the way they like. Plenty of businesses running an overlay have still been sued. The Federal Trade Commission has also taken action against a major overlay vendor over its marketing claims about what the product could do.

My take from the systems side: an overlay is a dashboard that reports green while the pipeline underneath is still broken. I've seen that pattern in Salesforce and HubSpot setups too many times to trust it anywhere. Fix the source, not the display.

## What Fixing It Actually Looks Like

For most small business sites, the work isn't dramatic. It's a pass through the templates to fix heading order, add real alt text, tighten contrast in the color palette, label every form field and make focus states visible. On a well-built site, that's a modest project. On a cluttered template site with a page builder stacked on top of plugins, it can be cheaper to rebuild than to patch. If you end up comparing designers for that rebuild, ask each one how they handle accessibility; my guide on [how to choose a web designer in DFW](/blog/how-to-choose-a-web-designer-in-dfw) lists the other questions worth asking.

Then keep it fixed. Accessibility breaks the same way tracking breaks: someone uploads a new photo without alt text, adds a new form, drops in a third-party widget. Put a quick check into your normal routine, the same way you'd review a [website performance audit checklist](/blog/website-performance-audit-checklist-small-business) every quarter.

I build accessibility into every site from the first wireframe, because adding it after launch always costs more. If you ran the 20-minute check and found more problems than you expected, [get in touch](/contact) and I'll walk through your site with you and tell you plainly whether it needs a cleanup or a rebuild.
