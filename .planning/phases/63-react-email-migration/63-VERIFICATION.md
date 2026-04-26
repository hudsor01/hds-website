     [1mSTDIN[0m
[38;5;8m   1[0m [37m---[0m
[38;5;8m   2[0m [37mphase: 63-react-email-migration[0m
[38;5;8m   3[0m [37mstatus: complete[0m
[38;5;8m   4[0m [37mcompleted: 2026-04-26[0m
[38;5;8m   5[0m [37mplans: ["63-01", "63-02", "63-03"][0m
[38;5;8m   6[0m [37m---[0m
[38;5;8m   7[0m 
[38;5;8m   8[0m [37m# Phase 63 Verification[0m
[38;5;8m   9[0m 
[38;5;8m  10[0m [37m## Exit gates met[0m
[38;5;8m  11[0m 
[38;5;8m  12[0m [37m| Gate | Status | Evidence |[0m
[38;5;8m  13[0m [37m|---|---|---|[0m
[38;5;8m  14[0m [37m| `@react-email/render` removed | YES | `grep -rn "@react-email/render" src/ package.json` returns zero |[0m
[38;5;8m  15[0m [37m| react-email v6 installed | YES | `react-email@6.0.0` in dependencies |[0m
[38;5;8m  16[0m [37m| All cyan eliminated from email files | YES | `grep -rnE "#0891b2|#06b6d4|#0e7490" src/` returns zero |[0m
[38;5;8m  17[0m [37m| Every send call uses `react:` prop | YES | one acceptable `html:` in sendWelcomeEmail (no cyan; raw HTML wraps dynamic sequence content) |[0m
[38;5;8m  18[0m [37m| Shared components in src/emails/_components/ | YES | brand-layout, brand-heading, brand-button, brand-footer, labelled-row |[0m
[38;5;8m  19[0m [37m| Token added when needed | YES | `--color-primary-deep` added for gradient stops |[0m
[38;5;8m  20[0m 
[38;5;8m  21[0m [37m## Automated checks[0m
[38;5;8m  22[0m 
[38;5;8m  23[0m [37m```[0m
[38;5;8m  24[0m [37mbun run typecheck   ✓[0m
[38;5;8m  25[0m [37mbun run lint        ✓[0m
[38;5;8m  26[0m [37mbun run test:unit   ✓ 385 / 0[0m
[38;5;8m  27[0m [37mbun run build       ✓[0m
[38;5;8m  28[0m [37m```[0m
[38;5;8m  29[0m 
[38;5;8m  30[0m [37m## Migrations complete[0m
[38;5;8m  31[0m 
[38;5;8m  32[0m [37m8 send sites migrated (1 deferred per acceptable trade-off):[0m
[38;5;8m  33[0m [37m- newsletter welcome ✓[0m
[38;5;8m  34[0m [37m- newsletter admin ✓[0m
[38;5;8m  35[0m [37m- contact admin ✓[0m
[38;5;8m  36[0m [37m- testimonial admin ✓[0m
[38;5;8m  37[0m [37m- calculator admin ✓[0m
[38;5;8m  38[0m [37m- calculator results ✓[0m
[38;5;8m  39[0m [37m- TTL calculator results ✓[0m
[38;5;8m  40[0m [37m- scheduled drip ✓[0m
[38;5;8m  41[0m [37m- contact welcome ⚠️ (defer — generic-template HTML, no brand drift)[0m
[38;5;8m  42[0m 
[38;5;8m  43[0m [37m## Pending user verification (visual)[0m
[38;5;8m  44[0m 
[38;5;8m  45[0m [37mTrigger one email from each migrated path against a dev mailbox; visually confirm in Apple Mail or Gmail web.[0m
