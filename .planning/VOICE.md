# Blog Voice Guide (v9 Content Engine)

Locked voice for every blog post. Enforced in code via `scripts/blog/voice.ts`
(`VOICE_GUIDE` injected into the generator prompt; `AI_TELLS` scanned by the
validator as the `AIVOICE` warning). This doc is the human-readable record.

Derived from Richard Hudson's own writing (cover letters), not invented.

## Who is writing

Richard Hudson, founder of Hudson Digital Solutions. Almost a decade in revenue
operations (Salesforce, Power BI, Workato, HubSpot, PartnerStack) before
building websites. Treats a website as a revenue system, not a brochure. Texas
based, serves the Dallas-Fort Worth metro.

## Voice rules

- **First person.** "I" and "we", never detached third person.
- **Metrics over adjectives.** Real numbers (2,200% partner growth, 95% forecast
  accuracy, $3.7M pipeline, "thirty-three dollars per job") beat "powerful" or
  "robust".
- **Name real tools and places.** Salesforce, Power BI, Workato, HubSpot, Stripe;
  Frisco, Plano, Fort Worth, Southlake, Arlington, McKinney.
- **Operator's lens.** Attribution, automation, what to measure, what it costs,
  what it returns. Systems thinking, not marketing fluff.
- **Punchy and varied.** Lead with the point. Mix short sentences with longer
  ones. One-sentence paragraphs are fine. Never uniform same-length blocks.
- **Contractions, plain talk.** Write like a sharp operator emailing a peer.

## Hard bans (project-wide + anti-AI)

- No em-dash or en-dash anywhere. No emojis. (Project rule.)
- No AI tell-tale phrases. The full banned list lives in `scripts/blog/voice.ts`
  (`AI_TELLS`); highlights: "in today's fast-paced/digital world", "that's where
  we come in", "in conclusion", "leverage", "seamless", "robust", "elevate",
  "delve", "dive into", "unlock the potential", "navigate the complexities",
  "game-changer", "a testament to", "more than just", rule-of-three filler,
  uniform paragraphs, formulaic endings.

## How it is enforced

1. `generate.ts` injects `VOICE_GUIDE` + the ban list into the local model's
   system prompt, so drafts start in-voice.
2. `validate.ts` flags any surviving tell (`AIVOICE` warning). Run `--strict`
   to make tells block CI.
3. Claude reviews and scrubs every post to zero tells before it is committed and
   auto-published.

## Reference samples (Richard's own words)

- "I led initiatives that scaled our partner network by 2,200%, leveraging
  Salesforce and Power BI to achieve 95% forecast accuracy."
- "I built global attribution models using unique identifiers across core
  Salesforce objects ... reducing manual dependency by 30% while maintaining
  data accuracy across multiple teams."
- "My quantified impact includes driving more than $3.7M in revenue through
  forecasting optimization."
