# Search Console Weekly Report - Setup

One-time setup (about 15 min) for the weekly Search Console report. Every
Monday at 12:00 UTC `.github/workflows/gsc-weekly-report.yml` runs
`scripts/gsc/report.ts`, which:

- runs URL Inspection on every blog post published in the last 30 days
- lists last-28-day queries sitting at position 5 to 20 (striking distance)
- adds one brand line (clicks and impressions for brand queries)

The result lands in one open GitHub issue labeled `gsc-report`, titled
`Search Console weekly report`. The workflow updates that issue in place every
week instead of opening a new one. When any URL is flagged, it also adds a
short comment so you get a notification.

Until this setup is done, each scheduled run fails red with
`GSC_SERVICE_ACCOUNT_JSON is not set` and GitHub emails you. Nothing else
breaks: the site never reads this secret.

**The key never goes into the repo, chat or logs.** You create it, store it as
a GitHub secret and delete the local file. Claude never sees it.

---

## Part A - Google Cloud (produce the JSON)

1. [console.cloud.google.com](https://console.cloud.google.com): create a
   project (for example `hds-search-console`) or pick an existing one.
2. **Enable the API:** APIs and Services > Library > search
   **Google Search Console API** > **Enable**.
3. **Create the service account:** IAM and Admin > Service Accounts >
   **Create service account**. Name: `gsc-weekly-report`. Skip the optional
   "grant roles" and "grant users" steps. No project roles are needed: access
   is granted on the Search Console side in Part B. Click **Done**.
4. **Create the key:** click the new service account > **Keys** tab >
   Add key > **Create new key** > **JSON** > **Create**. A `.json` file
   downloads. Treat it as a credential: it grants read access to Search
   Console data for as long as it exists.

   **If key creation is blocked:** organizations created on or after
   2024-05-03 enforce two constraints by default:
   `iam.disableServiceAccountKeyCreation` and
   `iam.managed.disableServiceAccountKeyCreation`. Either one blocks step 4.
   Pick one:

   - Override both for this project only. This needs the **Organization
     Policy Administrator** role (`roles/orgpolicy.policyAdmin`) on the
     organization. Project Owner and Workspace super admin do not include it
     by default; a super admin can grant it in IAM and Admin > IAM with the
     organization (not the project) selected. Then select this project, open
     IAM and Admin > Organization policies and repeat for each of the two
     constraints that shows as enforced: open it > **Manage policy** >
     **Override parent's policy** > **Not enforced** > **Set policy**. Retry
     step 4 only after both are overridden.
   - Use a project that has no organization (for example one created under a
     personal Google account) and repeat steps 1 to 4 there.

5. **Copy the service account email** (needed in Part B): it is the
   `client_email` field in the downloaded file, of the form
   `gsc-weekly-report@<project>.iam.gserviceaccount.com`. The email is not
   secret. Read only that field; do not open or paste the rest of the file.

## Part B - Search Console (grant access)

6. At [search.google.com/search-console](https://search.google.com/search-console),
   signed in as an owner of `sc-domain:hudsondigitalsolutions.com`: Settings >
   Users and permissions > **Add user**. Paste the service account email from
   step 5. Permission: **Restricted** (least privilege). Click **Add**. Service
   accounts get access at once, with no invitation to accept.

   **Fallback:** if a run fails with the `has no access to
   sc-domain:hudsondigitalsolutions.com` line while the account is already
   Restricted, change the role to Full. No Google doc states the permission
   level the URL Inspection API needs, so Restricted is the starting point.

## Part C - GitHub secret

7. Store the key minified (one line) so GitHub log masking covers it as a
   single value. `gh secret set` reads the value from stdin:

   ```bash
   jq -c . ~/Downloads/<key-file>.json | gh secret set GSC_SERVICE_ACCOUNT_JSON --repo hudsor01/hds-website
   ```

   Without `jq`, Bun does the same:

   ```bash
   bun -e 'process.stdout.write(JSON.stringify(JSON.parse(await Bun.file(process.argv[1]).text())))' ~/Downloads/<key-file>.json | gh secret set GSC_SERVICE_ACCOUNT_JSON --repo hudsor01/hds-website
   ```

8. Delete the local key file, then empty the Trash:

   ```bash
   rm ~/Downloads/<key-file>.json
   ```

   Never paste the file contents anywhere: not in an issue, a PR, a chat or a
   terminal transcript. If that happens, rotate the key (Part F).

## Part D - Verify

9. Run the workflow once, then watch that run by its id:

   ```bash
   gh workflow run gsc-weekly-report.yml --repo hudsor01/hds-website
   sleep 5
   gh run list --workflow gsc-weekly-report.yml --repo hudsor01/hds-website --limit 1
   run_id=$(gh run list --workflow gsc-weekly-report.yml --repo hudsor01/hds-website --limit 1 --json databaseId --jq '.[0].databaseId')
   gh run watch "$run_id" --repo hudsor01/hds-website --exit-status
   ```

   The short wait lets the new run appear. Check that the listed run is the
   one you just started (event `workflow_dispatch`, started a few seconds
   ago) before reading its result. Passing the id works in any shell, not
   only an interactive one.

   Then confirm exactly one open report issue exists:

   ```bash
   gh api "repos/hudsor01/hds-website/issues?labels=gsc-report&state=open" --jq '[.[] | select(.pull_request == null)] | length'
   ```

   It prints `1`. This uses the REST list endpoint on purpose: the
   search-backed label filter can lag right after a run.

10. Run the workflow a second time (repeat step 9). The same command still
    prints `1` and the issue body shows the new run date. Two runs, one issue.

**Notes for the maintainer:** after the first successful run, write down
whether Restricted was enough or Full was needed. Also note which verdict and
coverage the report showed for a post Google had not crawled yet. Both are
facts no Google doc states.

## Part E - Troubleshooting

A failed run prints one line starting with `gsc-report:` in the Build report
step log, leaves the issue untouched and fails red. Each Google request times
out after 30 s and is tried up to 3 times. The whole run stops after 6
minutes, inside the 10 minute job timeout, so a slow Google still ends with a
line from this table.

In the lines below, `<request>` is `Search Analytics request` or
`URL Inspection request`; `<n>` is an HTTP status or a count.

| Error line | Fix |
|------------|-----|
| `GSC_SERVICE_ACCOUNT_JSON is not set. Add it in repo Settings > Secrets and variables > Actions.` | Do Part C. |
| `GSC_SERVICE_ACCOUNT_JSON is not valid JSON. Store the downloaded key file contents unchanged.` | The secret was edited or truncated. Create a new key (step 4) and repeat step 7. |
| `GSC_SERVICE_ACCOUNT_JSON has a missing or invalid field: <fields>.` | The secret is not a service account key, or the named field was changed. Create a new JSON key and repeat step 7. |
| `GSC_SERVICE_ACCOUNT_JSON private_key is not a valid PKCS#8 RSA key. Create a new JSON key.` | The `private_key` value was damaged. Create a new JSON key and repeat step 7. |
| `Token request rejected: the JWT time window is invalid. Check the runner clock; do not rotate the key.` | A clock problem, not a key problem. Re-run the workflow. Do not rotate the key. |
| `Token request rejected (<error>): the key is revoked, deleted or from another project. Create a new JSON key and update GSC_SERVICE_ACCOUNT_JSON.` | Create a new key (step 4) and repeat step 7. |
| `Token request rejected (disabled_client): the service account key is disabled. Re-enable it or create a new JSON key.` | Re-enable the key on the service account Keys tab, or create a new one and repeat step 7. |
| `Token request rejected (invalid_scope): the requested scope is wrong. This is a bug in scripts/gsc/auth.ts.` | A code bug, not a key problem. Open an issue with the run link. Do not rotate the key. |
| `Token request failed with HTTP <n> (<code>).` | Google refused the token request for a reason the script does not map. If `<n>` is 429 or 5xx, Google was busy: re-run later. Otherwise create a new key (step 4) and repeat step 7. |
| `Token request failed with HTTP <n>.` | Same as the line above. |
| `Token response did not include an access token.` | Google answered without a token. Re-run the workflow. If it repeats, open an issue with the run link. |
| `Token request failed: network error.` | The runner could not reach Google in 3 attempts. Re-run the workflow. |
| `<request> was denied: <client_email> has no access to sc-domain:hudsondigitalsolutions.com. Add it in Search Console > Settings > Users and permissions as Restricted. If it is already Restricted and this request still fails, change it to Full.` | Do step 6. If the user is already Restricted, change the role to Full. |
| `The Google Search Console API is not enabled. Enable the Google Search Console API on the Cloud project that owns <client_email>.` | Do step 2 in the project named in the email domain. |
| `Search Console quota exceeded. The next weekly run will retry.` | No action. The next Monday run retries. |
| `Search Console rejected the token scope. This is a bug in scripts/gsc/auth.ts.` | A code bug, not a key problem. Open an issue with the run link. |
| `Search Console rejected the access token (HTTP 401). Check GSC_SERVICE_ACCOUNT_JSON and run again.` | Re-run the workflow. If it repeats, create a new key (step 4) and repeat step 7. |
| `Search Analytics request failed with HTTP <n> after 3 attempts.` | Google was down or throttling. Re-run the workflow later. |
| `Search Analytics request failed: network error.` | The runner could not reach Google in 3 attempts. Re-run the workflow. |
| `<request> failed with HTTP <n>.` | Google rejected the request itself (a 4xx), which is a code bug. Open an issue with the run link. |
| `<request> returned an unexpected response.` | Google answered in a shape the script does not expect. Re-run the workflow. If it repeats, open an issue with the run link. |
| `Every URL Inspection request failed (<n> of <n>). The issue was left unchanged. Re-run the workflow later.` | URL Inspection was down or throttling for the whole run. Re-run the workflow later. |
| `Run stopped at its 6 minute time budget because Google is slow or throttling requests. The issue was left unchanged. Re-run the workflow later.` | Re-run the workflow later. If it repeats every week, open an issue with the run link. |
| `Could not read the blog posts in content/blog. Run bun run blog:build locally to see which file fails.` | Run `bun run blog:build` locally, fix the post it names and merge the fix. |
| `unexpected error (details withheld so no credential can leak).` | A bug or a runner failure. The details are withheld on purpose. Re-run the workflow. If it repeats, open an issue with the run link. |
| `usage: bun run scripts/gsc/report.ts <output-file.md>` | The workflow called the script without an output path. Check the Build report step in `.github/workflows/gsc-weekly-report.yml`. |
| Any other failure, including a run cancelled with no `gsc-report:` line | Re-run the workflow. If it fails the same way again, open an issue with the run link. |

## Part F - Rotate or revoke

Keys never expire by default. A service account holds at most 10 keys.

**Rotate:** create a new key (step 4), repeat steps 7 and 8, run the workflow
once (step 9), then delete the old key on the service account Keys tab in the
Cloud console.

**Revoke** (any one of these stops access):

- Delete the key on the service account Keys tab in the Cloud console.
- Remove the service account user in Search Console > Settings > Users and
  permissions.
- Delete the GitHub secret:

  ```bash
  gh secret delete GSC_SERVICE_ACCOUNT_JSON --repo hudsor01/hds-website
  ```

---

## Reference

- Script modules: `scripts/gsc/` (`auth.ts` credential parse, JWT and token;
  `client.ts` throttled requests with retry; `rules.ts` flagging; `render.ts`
  markdown; `report.ts` entry point). Workflow:
  `.github/workflows/gsc-weekly-report.yml`.
- OAuth scope: `https://www.googleapis.com/auth/webmasters.readonly` (read
  only).
- Endpoints:
  - `POST https://oauth2.googleapis.com/token`
  - `POST https://searchconsole.googleapis.com/v1/urlInspection/index:inspect`
  - `POST https://searchconsole.googleapis.com/webmasters/v3/sites/sc-domain%3Ahudsondigitalsolutions.com/searchAnalytics/query`
- Quotas: URL Inspection allows 2,000 requests per day and 600 per minute per
  property. The script caps each run at 150 inspections.
- Time limits: each request times out after 30 s and the run stops after 6
  minutes, inside the workflow's 10 minute `timeout-minutes`.
- Official docs:
  - [Google OAuth 2.0 for service accounts](https://developers.google.com/identity/protocols/oauth2/service-account)
  - [Search Console API usage limits](https://developers.google.com/webmaster-tools/limits)
  - [GitHub Actions secure use](https://docs.github.com/en/actions/reference/security/secure-use)
