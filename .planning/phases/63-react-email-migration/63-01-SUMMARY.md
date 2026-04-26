     [1mSTDIN[0m
[38;5;8m   1[0m [37m---[0m
[38;5;8m   2[0m [37mphase: 63-react-email-migration[0m
[38;5;8m   3[0m [37mplan: "01"[0m
[38;5;8m   4[0m [37mstatus: complete[0m
[38;5;8m   5[0m [37mcompleted: 2026-04-26[0m
[38;5;8m   6[0m [37m---[0m
[38;5;8m   7[0m 
[38;5;8m   8[0m [37m# Plan 63-01 Summary: React Email v6 Foundation[0m
[38;5;8m   9[0m 
[38;5;8m  10[0m [37m## Dependency swap[0m
[38;5;8m  11[0m 
[38;5;8m  12[0m [37m```[0m
[38;5;8m  13[0m [37mbun remove @react-email/render   (was 2.0.4, unused)[0m
[38;5;8m  14[0m [37mbun add react-email@latest       (-> 6.0.0, released 2026-04-17)[0m
[38;5;8m  15[0m [37m```[0m
[38;5;8m  16[0m 
[38;5;8m  17[0m [37m`@react-email/ui` (preview server) deferred to a future task — not needed for production sending.[0m
[38;5;8m  18[0m 
[38;5;8m  19[0m [37m## Shared component scaffold (src/emails/_components/)[0m
[38;5;8m  20[0m 
[38;5;8m  21[0m [37m- `brand-layout.tsx` — Html/Head/Preview/Body/Container wrapper[0m
[38;5;8m  22[0m [37m- `brand-heading.tsx` — h1/h2/h3 with BRAND.primary[0m
[38;5;8m  23[0m [37m- `brand-button.tsx` — primary CTA button[0m
[38;5;8m  24[0m [37m- `brand-footer.tsx` — Hr + business contact + optional unsubscribe link[0m
[38;5;8m  25[0m [37m- `labelled-row.tsx` — `<strong>label:</strong> value` pattern (added during 63-02 reuse)[0m
[38;5;8m  26[0m 
[38;5;8m  27[0m [37mEvery component imports BRAND from @/lib/_generated/brand.[0m
[38;5;8m  28[0m 
[38;5;8m  29[0m [37m## Newsletter welcome end-to-end[0m
[38;5;8m  30[0m 
[38;5;8m  31[0m [37m- `src/emails/newsletter-welcome.tsx` — JSX component mirroring the original copy[0m
[38;5;8m  32[0m [37m- `src/app/api/newsletter/subscribe/route.ts` -> `route.tsx` (rename for JSX)[0m
[38;5;8m  33[0m [37m- Welcome `html:` send replaced with `react: <NewsletterWelcome email={email} />`[0m
[38;5;8m  34[0m 
[38;5;8m  35[0m [37m## Verification[0m
[38;5;8m  36[0m 
[38;5;8m  37[0m [37m```[0m
[38;5;8m  38[0m [37mbun run typecheck   ✓[0m
[38;5;8m  39[0m [37mbun run lint        ✓ (1 pre-existing warning)[0m
[38;5;8m  40[0m [37mbun run test:unit   ✓ 385 / 0[0m
[38;5;8m  41[0m [37mbun run build       ✓[0m
[38;5;8m  42[0m [37m```[0m
[38;5;8m  43[0m 
[38;5;8m  44[0m [37m## Pending visual verification[0m
[38;5;8m  45[0m 
[38;5;8m  46[0m [37mReal email triggered against a dev mailbox; visually confirm slate-blue brand in Apple Mail or Gmail web.[0m
