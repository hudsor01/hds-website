# Blog content (`content/blog/`)

The only source of truth for blog posts. Each `*.md` file is one post. At build
time `scripts/blog/build.ts` validates every file and compiles the published ones
into `src/lib/_generated/blog-posts.ts`, which the site serves directly (no
database). Merging a file is publishing it. See
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
publishedAt: "2026-06-17"      # date
published: true                # R14
featured: false                # optional
featureImage: ""               # optional in-article hero; OG image is always the dynamic card
readingTime: 0                 # optional; auto-computed from word count if 0/absent
bodyFormat: "markdown"         # "markdown" (default) or "html" (migrated posts)
---

First paragraph is the share hook (R13).

## A Section (R7: H2/H3 structure)
...body... with at least 2 internal links (R5): one tool/service, one related post,
and one clear CTA (R6) to /contact or a /tools/* page.
```

## Guardrails (enforced by `scripts/blog/validate.ts`, CI gate; errors also fail `blog:build`)

R1 title <=60 + keyword - R2 excerpt 120-160 - R3 kebab slug - R4 primary pillar
tag in taxonomy - R5 >=2 internal links - R6 a CTA link - R7 H2 + keyword early -
R8 1000-2000 words + readingTime - R9 no em/en-dash, no emoji - R11/R12 OG image
(guaranteed by the dynamic `opengraph-image` card) - R14 publishes + renders.
Full list: `.planning/milestones/v9-REQUIREMENTS.md`.

## Commands

```bash
bun run blog:validate              # lint every post against R1-R9/R14 (CI gate)
bun run blog:build                 # compile published posts for the site (runs in dev/build)
bun run blog:generate -- --pillar 3 --topic "..."  # LM Studio draft -> new .md
```

Generation uses the local LM Studio model `mistral-small-3.2-24b-instruct-2506-mlx`
at `http://localhost:1234/v1`; Claude reviews every draft before commit.
