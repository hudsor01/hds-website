# Blog content (`content/blog/`)

The only source of truth for blog posts. Each `*.md` file is one post. At build
time `scripts/blog/build.ts` validates every file and compiles the published ones
into `src/lib/_generated/blog-posts.ts`, which the site serves directly (no
database). Merging a file is publishing it, unless its `publishedAt` is in the
future: then it waits in the repo and goes live on that date (UTC), when the
daily `publish-scheduled-posts` workflow rebuilds production. See
`.planning/milestones/v9-REQUIREMENTS.md` for the v9 content rules.

## File = one post

- Filename: `<slug>.md` (the slug is the URL: `/blog/<slug>`).
- Frontmatter (YAML) + body. Body is Markdown by default (converted to HTML at
  build via `marked`, then sanitized on render by `BlogPostContent`).

## Frontmatter

```yaml
---
title: "Post title"            # R1: <= 60 chars, contains targetKeyword
slug: "post-title"             # R3: unique kebab-case (matches filename)
excerpt: "Meta description."   # R2: 120-160 chars, no markdown
targetKeyword: "keyword"       # R1/R7: appears in title, H1, first 100 words
pillar: 3                      # 1-10, the content pillar (tracking/distribution)
tags: ["seo", "local-marketing"] # R4: tags[0] = primary pillar tag (taxonomy slug)
author: "richard-hudson"       # author slug (src/lib/constants/blog.ts)
publishedAt: "2026-06-17"      # date; a future date schedules the post
published: true                # R14
featured: false                # optional
featureImage: ""               # optional in-article hero; OG image is always the dynamic card
readingTime: 0                 # optional; auto-computed from word count if 0/absent
bodyFormat: "markdown"         # "markdown" (default) or "html" (migrated posts)
---

First paragraph is the share hook (R13).

## A Section (R7: H2/H3 structure)
...body... with at least 2 internal links (R5): one tool/service, one related post
and one clear CTA (R6) to /contact or a /tools/* page.
```

## Guardrails (enforced by `scripts/blog/validate.ts`, CI gate; errors also fail `blog:build`)

R1 title <=60 + keyword - R2 excerpt 120-160 - R3 kebab slug - R4 primary pillar
tag in taxonomy - R5 >=2 internal links - R6 a CTA link - R7 H2 + keyword early -
R8 1000-2000 words + readingTime - R9 no em/en-dash, no emoji - R11/R12 OG image
(guaranteed by the dynamic `opengraph-image` card) - R14 publishes + renders.
Full list: `.planning/milestones/v9-REQUIREMENTS.md`.

### Cross-post links (`scripts/blog/lib.ts` linkViolations, run by `blog:validate` and `blog:build`)

Errors (fail the build and the CI gate):

- a link to a post slug that does not exist
- a link from a published post to a `published: false` post
- a raw HTML `<a href="/blog/...">` to a post that is not live yet (use a markdown
  link instead)

Inbound threshold, counted per published post:

- orphan: no qualifying inbound links from other posts. An error: it fails
  `blog:build` (and so `dev`, `build`, `typecheck`, `test:unit` and the deploy)
  with a message naming the slug
- below: exactly 1 qualifying inbound link (a warning)

A link counts toward a post's inbound total if the linking post is published and is
either live already or dated on or before the post it links to. Links to scheduled
posts render as plain text until the target's date, then the scheduled-publish
rebuild turns them into links.

The rule for new posts: every new published post ships with at least 2 qualifying
inbound links from related posts dated on or before it, in the same PR. 0 fails the
build; 1 is a warning. Check with `bun run blog:links`.

## Commands

```bash
bun run blog:validate              # lint every post against R1-R9/R14 (CI gate)
bun run blog:build                 # compile live posts for the site (runs in dev/build)
bun run blog:links                 # inbound link report per published post (never fails)
bun run scripts/blog/pending.ts https://hudsondigitalsolutions.com  # due posts not live yet
bun run blog:generate -- --pillar 3 --topic "..."  # LM Studio draft -> new .md
```

Generation uses the local LM Studio model `qwen3.6-35b-a3b-mlx` (override with `LM_STUDIO_MODEL`)
at `http://localhost:1234/v1`; Claude reviews every draft before commit.
