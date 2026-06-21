/**
 * Build a fully self-contained prompt for a browser-automation agent that does
 * NOT have local file access: embeds all 87 captions + the Meta Business Suite
 * scheduling instructions inline. Writes .planning/social/facebook-agent-prompt.md
 *   bun run scripts/blog/social-prompt.ts
 */
import { readFileSync, writeFileSync } from 'node:fs'

interface Row {
	order: number
	caption: string
}

const rows: Row[] = JSON.parse(readFileSync('/tmp/hds-fb-final.json', 'utf8'))

const header = `# Task: schedule 87 Facebook posts in Meta Business Suite

You are a browser-automation agent. Chrome is already open and logged in to Meta
Business Suite (business.facebook.com) for the Facebook Page "Hudson Digital
Solutions". Schedule the 87 posts listed at the end, IN THE GIVEN ORDER.

## Scheduling cadence
Post 3 per day at these US Central times: 7:00 AM, 1:00 PM, and 7:00 PM.
Assign posts to slots in order: POST 1 to the earliest open slot, POST 2 to the
next, and so on. Start from the next available slot from right now (if a time
today has already passed, skip it and use the next one). Continue day by day
until all 87 are scheduled (about 30 days out).

## Steps for EACH post (Meta Business Suite)
1. Click "Create post".
2. Confirm "Post to" is the "Hudson Digital Solutions" Facebook page; select it if not.
3. Click the post text box and enter the caption EXACTLY as given (it already
   includes the blog link and hashtags). Wait a few seconds for the link
   preview card to load under the text. It should show a branded card with the
   HUDSON logo and the article title (not a headshot).
4. If a hashtag suggestion dropdown appears, press Escape to dismiss it.
5. Scroll down to the "Schedule" section and turn ON "Set date and time".
6. Set the Date to this slot's date.
7. Set the Time to this slot's time. IMPORTANT: the time control has separate
   Hours, Minutes, and AM/PM fields and is finicky. After setting it, VERIFY it
   reads the exact target (e.g. "07:00 AM"). If it shows anything else, correct
   it (clear and re-enter, or use the up/down arrows on each segment). Do NOT
   continue until the displayed time is exactly right.
8. Make sure "Share to ... Facebook story" is OFF (do not cross-post to Story).
9. Leave Privacy as "Public".
10. Click "Schedule" (NEVER "Publish" - do not post immediately).
11. If a "Boost post" / advertising upsell appears, click "Maybe later" or close
    it. NEVER click "Boost" and never spend any money.
12. Go back and create the next post.

## Hard rules
- Always SCHEDULE for the future; never publish immediately.
- Never boost, never run ads, never spend money - decline every paid upsell.
- Only ever post to the "Hudson Digital Solutions" Facebook page.
- Verify each scheduled time is exactly correct before moving on.
- Use the captions verbatim. Do not edit them, add emojis, or change hashtags.
- If a post titled "5 Signs Your Website is Costing You Customers" (POST 1) is
  already published on the page, skip POST 1.
- After every ~10 posts, glance at the calendar/Planner to confirm they are
  appearing as scheduled posts at the right times.

## The 87 posts (schedule in this order)
`

const body = rows
	.sort((a, b) => a.order - b.order)
	.map(r => `\n----- POST ${r.order} -----\n${r.caption}\n`)
	.join('')

writeFileSync('.planning/social/facebook-agent-prompt.md', `${header}${body}\n`)
console.warn(
	`wrote .planning/social/facebook-agent-prompt.md (${rows.length} posts)`
)
