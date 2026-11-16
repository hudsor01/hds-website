# Blog fixtures

Fixed posts for the `@visual` Playwright suite. `bun run test:e2e:visual` sets
`BLOG_CONTENT_DIR=tests/fixtures/blog`, so `scripts/blog/build.ts` compiles these
instead of `content/blog` and `/blog` renders the same page on every run, no matter
which posts have been published or scheduled since the baselines were captured.

Every post is dated in the past and marked `legacy: true` (structural validation
only). Frontmatter changes (title, excerpt, dates, featured, readingTime) change the
`/blog` baselines: regenerate them with the "Update Visual Baselines" workflow. Body
edits do not, because the index cards never render the body.

The bodies link to each other in a ring (each post links the next two by date)
because `blog:build` runs the inbound-link rules on this directory too.
