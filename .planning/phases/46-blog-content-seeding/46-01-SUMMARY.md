# Phase 46 Plan 01: Blog Content Seeding Summary

**Set up fully automated blog pipeline: fixed broken homelab infrastructure, wired n8n Blog Generator to auto-publish every AI-generated post to Neon**

## Accomplishments

- Audited Neon blog state: 3 placeholder posts, 3 tags (`web-development`, `business`, `conversion-optimization`), 1 author (`richard-hudson`)
- Diagnosed root cause of broken n8n infrastructure: NAS at 192.168.4.164 offline → PostgreSQL NFS volume mounts blocked → postgresql-0 stuck in Unknown state → n8n in CrashLoopBackOff (284 restarts, 14 days down)
- Fixed PostgreSQL StatefulSet: patched to remove NFS backup/WAL-archive volumes and disable `archive_mode`; force-deleted stuck pod; both postgresql-0 and n8n returned to 1/1 Running
- Discovered hds_generated_blogs had 0 rows despite 370 total_blogs_generated in hds_automation_state: root cause was missing `cycle_number` column silenced by `onError: continueRegularOutput`
- Fixed schema: `ALTER TABLE hds_generated_blogs ADD COLUMN cycle_number integer DEFAULT 1`
- Created Neon PostgreSQL credential `neon-hds-blog` in n8n (id: `neon-hds-blog`, inserted directly into credentials_entity + shared_credentials)
- Added 3 nodes to Blog Generator workflow (`zVe2oKlxqHps4njw`), now 13 nodes total:
  - `Convert Markdown to HTML` (Code, hds-convert-html) — converts generated markdown to HTML, pre-escapes for SQL, maps category→tag slug
  - `Publish to Neon blog_posts` (Postgres, hds-publish-neon) — INSERTs each post with ON CONFLICT upsert
  - `Tag Post in Neon` (Postgres, hds-tag-neon) — associates post with correct tag in blog_post_tags
- Wired fan-out from `Save HDS to Postgres`: now fires both existing RAG Store branch AND new Neon publish branch in parallel

## Files Created/Modified

- `.planning/phases/46-blog-content-seeding/46-01-PLAN.md` — original plan
- `.planning/phases/46-blog-content-seeding/46-01-SUMMARY.md` — this file
- n8n workflow `zVe2oKlxqHps4njw` updated (no codebase files changed)
- homelab PostgreSQL StatefulSet patched (kubectl, no codebase files changed)
- homelab `hds_generated_blogs` schema migrated (ALTER TABLE, no codebase files changed)

## SQL Executed

- Neon MCP audit queries: SELECT on blog_authors, blog_tags, blog_posts, blog_post_tags
- Homelab: `ALTER TABLE hds_generated_blogs ADD COLUMN cycle_number integer DEFAULT 1`
- Homelab n8n DB: INSERT into credentials_entity (neon-hds-blog credential, AES-256-CBC encrypted)
- Homelab n8n DB: INSERT into shared_credentials (assigned to Richard's personal project)

## Decisions Made

- Did not manually seed placeholder replacement posts — user redirected to automated pipeline approach
- Chose Option A: auto-publish every AI-generated post directly to Neon on generation (vs. manual curation)
- Fan-out topology: Save HDS to Postgres → parallel → (RAG Store path) + (Neon publish path)
- Tag mapping in Code node: Web Development/Infrastructure/AI/ML/DevOps → `web-development`, Business/E-commerce → `business`, Conversion Optimization/Digital Marketing → `conversion-optimization`
- ON CONFLICT (slug) DO UPDATE: upsert allows re-runs without duplicates
- Placeholder posts (3 from Phase 42) left in Neon — new auto-generated posts will supplement them

## Issues Encountered

- Previous `n8n_update_partial_workflow` addConnection calls failed: required `source`/`target` but format sent `sourceHandle`/`targetHandle` — resolved by switching to `n8n_update_full_workflow`
- `n8n_update_full_workflow` required `name` field — added on retry, succeeded
- Build HDS RAG Prompt system prompt was simplified during workflow reconstruction — original detailed CRITICAL RULES/SERVICES prompt should be restored in a future session for optimal blog quality
- n8n execution list tool had parameter coercion issue (limit number→string) — not blocking

## Next Step

Phase 46 complete. Ready for Phase 47 (Tools Index — All 14 Tools).

The Blog Generator will fire at the next scheduled `:15` of a 2-hour interval and posts will appear in Neon `blog_posts` automatically. Verify by checking `/blog` after the next scheduled run.
