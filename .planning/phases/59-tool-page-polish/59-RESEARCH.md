# Phase 59: Tool Page Polish - Research

**Researched:** 2026-03-01
**Domain:** Next.js component layout, Tailwind CSS design system, tool page architecture
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Header section:**
- Title + subtitle only — no icons, breadcrumbs, trust signals, or CTAs
- Header sits below the navbar, inside the page content area (not hero-style)
- Background treatment: Claude's discretion (align with Phase 58 glass/card system)

**Layout structure:**
- Desktop: Use two-column layout (form left, result right) when it prevents the user from having to scroll to see results; use single-column (stacked) for simpler tools where two-column doesn't improve UX
- Mobile: Claude's discretion — single-column stacked is the safe default
- All 13 tools share a single `ToolPageLayout` component with slot-based customization — tools pass form and result content as children/slots
- Result area before submit: empty placeholder state with a descriptive prompt (e.g., "Fill in the form to generate your paystub")

**Result/output display:**
- Output is contained in a card with a clear visual boundary (consistent with Phase 58 glass-card patterns)
- Actions available on the result card: Copy to clipboard, Download, Print, Reset/clear form
- Actions are declared per-tool in the layout config — only shown where applicable to that tool's output type
- No loading state — results appear instantly after submit (submit button loading state via useFormStatus handles in-flight indication)

**Form field treatment:**
- Labels sit above inputs
- Validation errors: displayed below the field in red text, triggered on form submit (not on blur)
- Help text: optional muted text below the label, used where the field needs explanation
- Submit button placement: Claude's discretion based on form length and mobile UX

### Claude's Discretion
- Header background treatment (gradient, glass, or plain — align with Phase 58 tokens)
- Mobile layout specifics
- Submit button positioning strategy
- Exact spacing, typography sizing, and component variants within the design system

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TOOL-01 | All tool pages have a consistent header treatment — tool title, description, and clear framing (not just a raw form) | New `ToolPageLayout` component replaces `CalculatorLayout`; header uses `text-h1`/`text-lead` tokens from Phase 56 |
| TOOL-02 | Tool form fields are styled to the design system — not generic browser defaults or unstyled shadcn components | Phase 58 `Input` component has `bg-surface-sunken`, `aria-invalid` error states; `CalculatorInput` wraps it with label-above pattern; select/textarea need same treatment |
| TOOL-03 | Tool output/results display has dedicated, polished presentation — result cards, data labels, print/download action styling | New `ToolResultCard` component using Phase 58 `glass-card-light` / `Card variant="glassLight"`; per-tool action buttons via config |
| TOOL-04 | Tools index page has a polished grid layout matching the design system card treatment | Tools index `page.tsx` already uses `bg-surface-raised border-border` cards; needs `glass-card-light` or `Card variant="glassLight"` upgrade to match Phase 58 polish |
</phase_requirements>

---

## Summary

Phase 59 applies the Phase 58 design system to all 13 tool pages using a single shared `ToolPageLayout` component. The existing `CalculatorLayout` is the direct predecessor — it already provides the structural skeleton (header, content wrapper, back link, trust signals) but uses the old icon-driven header pattern and single-column full-width layout for all tools. The new `ToolPageLayout` replaces this with a title+subtitle-only header, intelligent column selection per tool, and a dedicated result card area.

The 13 tools fall into three groups by layout complexity: (1) **already two-column** — TTL calculator uses a `lg:grid-cols-3` pattern with its own `Calculator` component that is not wrapped in `CalculatorLayout`; (2) **single-column stacked, simple output** — tip calculator, JSON formatter, meta-tag generator, testimonial collector; (3) **form-heavy, long output that benefits from two-column** — ROI, cost estimator, mortgage, paystub, invoice, contract, proposal, performance. All 12 that use `CalculatorLayout` need migration to `ToolPageLayout`. The TTL calculator (`Calculator.tsx`) needs the header updated to match, even if its internal two-column grid is kept.

The result area design decision is per-tool: the `ToolPageLayout` takes an `actions` config prop (array of `{ type: 'copy' | 'download' | 'print' | 'reset', label: string }`) and renders the action bar only when actions are provided. Tools with text/number outputs get Copy; PDF-generating tools (invoice, contract, proposal) already have Download; Print applies to paystub; Reset is universal. This approach avoids a global all-or-nothing action bar.

**Primary recommendation:** Replace `CalculatorLayout` with a new `ToolPageLayout` in `src/components/layout/` that accepts form and result as explicit slot props, a `columns` prop (`'single' | 'two'`), and an `actions` config array. Migrate all 13 tools to use it. Do NOT restructure tool logic — layout only.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React (Next.js 15 App Router) | current | Server + client component composition | Project stack |
| Tailwind CSS v4 | current | Utility-first styling with Phase 56-58 tokens | Project stack |
| class-variance-authority (cva) | current | Variant-based component APIs | Already used in `Card`, `Input`, `Button` |
| Lucide React | current | Action icons (Copy, Download, Printer, RotateCcw) | Project icon standard |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `cn` from `@/lib/utils` | — | Conditional className merging | All component composition |
| `Card` from `@/components/ui/card` | — | Glass/surface card primitives | Result card wrapping |
| `Button` from `@/components/ui/button` | — | Action buttons (Copy, Download, Print, Reset) | Action bar |
| `Input` from `@/components/ui/input` | — | Already Phase 58-styled; `bg-surface-sunken`, `aria-invalid` | All form inputs |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| New `ToolPageLayout` | Extend `CalculatorLayout` | `CalculatorLayout` has icon slot, trust signals section, and mixed layout behavior — cleaner to replace than patch |
| Per-tool result card component | Generic `ToolResultCard` with config | Per-tool components create duplication across 13 tools — config prop preferred for YAGNI |

**Installation:** No new packages required. All dependencies already in project.

---

## Architecture Patterns

### Recommended Project Structure

```
src/components/layout/
├── ToolPageLayout.tsx      # NEW: shared layout for all 13 tools
└── (existing layout files...)

src/components/calculators/
├── CalculatorInput.tsx     # EXISTING: keep as-is (label-above pattern already correct)
├── CalculatorLayout.tsx    # EXISTING: keep but deprecate (TTL calculator uses via Calculator.tsx)
├── CalculatorResults.tsx   # EXISTING: keep for ROI/mortgage where it's used
├── ResultsPanel.tsx        # EXISTING: TTL-specific, keep as-is
└── ComparisonView.tsx      # EXISTING: TTL-specific, keep as-is

src/app/tools/
├── page.tsx                # UPDATE: upgrade card styling to Phase 58 tokens (TOOL-04)
├── paystub-calculator/
│   ├── page.tsx            # UPDATE: pass ToolPageLayout props
│   └── PaystubCalculatorClient.tsx  # UPDATE: remove CalculatorLayout, wrap with slot API
└── [other tools]/          # Similar pattern per tool
```

### Pattern 1: ToolPageLayout — Slot-based Shared Layout

**What:** A single layout component that all 13 tools import. It handles the header, two-column/single-column body, result placeholder state, and action button bar. Tool-specific content is passed as `formSlot` and `resultSlot` props.

**When to use:** Every tool page, replacing `CalculatorLayout`.

**Example structure:**
```typescript
// src/components/layout/ToolPageLayout.tsx
'use client'

import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Copy, Download, Printer, RotateCcw } from 'lucide-react'
import Link from 'next/link'

type ActionType = 'copy' | 'download' | 'print' | 'reset'

interface ToolAction {
  type: ActionType
  label: string
  onClick?: () => void
  href?: string
}

interface ToolPageLayoutProps {
  title: string
  description: string
  columns?: 'single' | 'two'
  formSlot: ReactNode
  resultSlot?: ReactNode
  hasResult?: boolean
  resultPlaceholder?: string
  actions?: ToolAction[]
  className?: string
}
```

**Header treatment:** Plain background (no hero treatment), tight padding below navbar. Uses `text-h1 text-foreground` for title, `text-lead text-muted-foreground` for description. Aligns with Phase 58 typography scale tokens already in globals.css.

**Two-column logic:** When `columns="two"`, render a CSS grid (`grid lg:grid-cols-[1fr_1fr]` or `[3fr_2fr]` for form-heavy tools). When `columns="single"`, render full-width stacked layout.

### Pattern 2: Per-tool Layout Column Decision

The criterion from CONTEXT.md: "does the user need to scroll to see results?" Applied to each tool:

| Tool | Columns | Reasoning |
|------|---------|-----------|
| ROI Calculator | two | Results appear after submit; form has 4 fields; two-column prevents scroll |
| Cost Estimator | two | Long form + results; prevents scroll |
| Performance Calculator | two | Real PageSpeed fetch + results; two-column prevents scroll |
| Mortgage Calculator | two | 9+ inputs + detailed results; two-column prevents scroll |
| TTL Calculator | two | Already uses `lg:grid-cols-3` via own `Calculator.tsx`; keep internal layout, update header only |
| Paystub Calculator | single | Multi-step form with navigation between periods; results replace the view |
| Invoice Generator | single | Full-page document builder; PDF preview takes full width |
| Contract Generator | single | Full-page document builder; same as invoice |
| Proposal Generator | single | Full-page document builder; same as invoice |
| Tip Calculator | single | Simple, results appear inline below form; no scroll issue |
| JSON Formatter | two | Input textarea left, formatted output right — side by side is canonical UX |
| Meta-Tag Generator | two | Form inputs left, generated tag preview right |
| Testimonial Collector | single | Link generator; result is compact and appears inline |

**Confidence:** MEDIUM — the two-column decisions for JSON formatter and meta-tag generator are inferred from UX convention, not user-confirmed. Planner should note these as implementation decisions.

### Pattern 3: Result Card with Action Bar

The result area is a `Card variant="glassLight"` (established in Phase 58) with a sticky or inline action bar at the top-right corner or bottom of the card.

```typescript
// Action bar inside result card
<div className="flex items-center gap-2 mb-4">
  {actions.map(action => (
    <Button key={action.type} variant="ghost" size="sm" onClick={action.onClick}>
      <ActionIcon type={action.type} className="h-4 w-4 mr-1.5" />
      {action.label}
    </Button>
  ))}
</div>
```

Actions per tool:
- **Copy to clipboard:** ROI, Cost Estimator, Performance, Mortgage, Tip, JSON Formatter, Meta-Tag Generator, TTL
- **Download (PDF):** Invoice, Contract, Proposal, Paystub
- **Print:** Paystub (window.print() already wired in PaystubNavigation)
- **Reset/clear form:** All tools (clears inputs and result)

### Pattern 4: Result Placeholder State

Before the user submits, show an empty state in the result panel:

```tsx
{!hasResult && (
  <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center py-12">
    <p className="text-muted-foreground text-sm">{resultPlaceholder}</p>
  </div>
)}
```

This applies only to two-column tools where the result pane is always visible. Single-column tools show results below the form when available.

### Anti-Patterns to Avoid

- **Changing tool logic:** Phase 59 is layout-only. Do not touch calculation functions, API calls, state management, or PDF generation.
- **Removing the `CalculatorResults` email capture:** The `CalculatorResults` component has an email capture form used in ROI and Mortgage. Removing this would change functionality. Keep as-is inside the result slot.
- **Making `ToolPageLayout` a Server Component:** Layout needs `'use client'` because action button handlers (`onClick` for copy/print/reset) are passed as props. A server wrapper + client inner is possible but adds complexity YAGNI would reject.
- **Adding icons to the header:** Locked decision: title + subtitle only, no icons.
- **Global action bar for all tools:** Actions are declared per-tool in config — not globally applied.
- **Hardcoding column width:** Use `grid-cols-[3fr_2fr]` or similar rather than `grid-cols-2` when form is significantly longer than result for better visual balance.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Clipboard copy | Custom clipboard util | `navigator.clipboard.writeText()` | Native browser API; pattern already in `Calculator.tsx` (TTL tool) |
| Print functionality | Custom print logic | `window.print()` | Already used in TTL `Calculator.tsx` and Paystub `PaystubNavigation`; CSS print media queries already in codebase |
| Card with glass effect | New CSS | `Card variant="glassLight"` (`glass-card-light` class) | Phase 58 established this token; defined in globals.css |
| Result action buttons | Icon buttons from scratch | `Button variant="ghost" size="sm"` + Lucide icons | Phase 58 Button component has all needed variants |
| Responsive column toggle | CSS `@media` query in component | Tailwind responsive prefix `lg:grid-cols-2` | Native Tailwind approach; consistent with rest of codebase |

**Key insight:** The Phase 56-58 design system has all the primitives needed. This phase is composition, not invention.

---

## Common Pitfalls

### Pitfall 1: `CalculatorLayout` Still Used by TTL Calculator

**What goes wrong:** `Calculator.tsx` (used by TTL calculator's `page.tsx`) has its own header inline — it does NOT use `CalculatorLayout`. If you only swap `CalculatorLayout` imports everywhere, the TTL calculator gets missed.

**Why it happens:** TTL calculator was built before `CalculatorLayout` was standardized. Its `page.tsx` renders `<Calculator />` directly, which has its own header div.

**How to avoid:** Treat TTL as a special case. Update the header section inside `Calculator.tsx` to match the `ToolPageLayout` header style (title + subtitle with Phase 58 tokens) rather than wrapping the whole `Calculator.tsx` in `ToolPageLayout`.

**Warning signs:** After migration, the TTL calculator page still shows the old icon-beside-title header pattern.

### Pitfall 2: `'use client'` Propagation

**What goes wrong:** `ToolPageLayout` needs to be `'use client'` (for action button `onClick` handlers). If it's placed in `components/layout/` alongside `NavbarLight` (which is also a client component), this is fine. But if any tool's `page.tsx` (which must be a server component to export `metadata`) imports `ToolPageLayout` directly, the entire page becomes a client component.

**Why it happens:** Next.js 15 App Router: server components cannot import client components that export metadata, and `page.tsx` files exporting `metadata` cannot have `'use client'`.

**How to avoid:** Current pattern already handles this correctly. Tool `page.tsx` files are server components that export `metadata`; they render a `ToolNameClient.tsx` component which is `'use client'`. Keep this pattern: `page.tsx` → `ToolNameClient.tsx`. `ToolNameClient.tsx` imports `ToolPageLayout`. Do NOT put `ToolPageLayout` in `page.tsx`.

**Warning signs:** TypeScript error "cannot export metadata from a client component."

### Pitfall 3: Tools That Wrap `CalculatorLayout` Internally

**What goes wrong:** Some tools wrap `CalculatorLayout` inside their `Client.tsx` file (e.g., `InvoiceGeneratorClient.tsx`, `JsonFormatterClient.tsx`). When migrating, the `CalculatorLayout` wrapper must be removed from the Client component and the tool content passed as `formSlot`/`resultSlot` props. But some tools (ROI, Mortgage) use `CalculatorLayout` in `page.tsx` (a server component), passing the `Client` as a child.

**Why it happens:** Inconsistent integration pattern across the 13 tools when they were originally built.

**How to avoid:** Audit each tool before migrating. Two integration styles exist:

- Style A (in `page.tsx`): `ROICalculatorPage` → renders `<CalculatorLayout>` + `<ROICalculatorClient />` inside
- Style B (in `Client.tsx`): `InvoiceGeneratorClient` → renders `<CalculatorLayout>` wrapping its own content

For Style A tools: move `ToolPageLayout` into the `Client.tsx` (since layout needs client for actions).
For Style B tools: `CalculatorLayout` import in `Client.tsx` swaps to `ToolPageLayout`.

**Tools by style:**

Style A (layout in `page.tsx`):
- `roi-calculator/page.tsx` — wraps `<ROICalculatorClient />`
- `cost-estimator/page.tsx` — wraps `<CostEstimatorClient />`
- `mortgage-calculator/page.tsx` — wraps `<MortgageCalculatorClient />`

Style B (layout in `Client.tsx`):
- `invoice-generator/InvoiceGeneratorClient.tsx`
- `json-formatter/JsonFormatterClient.tsx`
- `meta-tag-generator/MetaTagGeneratorClient.tsx`
- `contract-generator/ContractGeneratorClient.tsx`
- `proposal-generator/ProposalGeneratorClient.tsx`
- `performance-calculator/PerformanceCalculatorClient.tsx`
- `testimonial-collector/TestimonialCollectorClient.tsx`
- `tip-calculator/TipCalculatorClient.tsx`
- `paystub-calculator/PaystubCalculatorClient.tsx`

For Style A tools, migration means: (1) move `ToolPageLayout` call into the `Client.tsx` component, (2) strip the server-side `CalculatorLayout` wrapper from `page.tsx`. This is safe because TOOL-01/03 compliance requires action button handlers which need client-side code anyway.

### Pitfall 4: Result Placeholder Only in Two-Column Tools

**What goes wrong:** Adding a permanent "empty state" pane to single-column tools (invoice, contract, proposal, paystub) that already reveal results below the form creates a jarring double-content area — placeholder + eventual result stacked.

**Why it happens:** Misapplying the two-column placeholder pattern to single-column tools.

**How to avoid:** The placeholder state only renders in the right column when `columns="two"` AND `hasResult === false`. Single-column tools render results conditionally below the form (current behavior), with no persistent empty pane.

### Pitfall 5: Select Element Styling Gap

**What goes wrong:** The `Input` component (`bg-surface-sunken`, focus ring) is polished. But `<select>` elements (used in Mortgage calculator for loan term) are raw native elements with no styling. They will look out of place.

**Why it happens:** shadcn `Select` component is available but not used consistently — Mortgage calculator uses a raw `<select>`.

**How to avoid:** Replace raw `<select>` elements with shadcn `Select` component from `@/components/ui/select` (already used in `CostEstimatorClient.tsx`). This is styling work consistent with TOOL-02 (form fields styled to design system). Only 2-3 raw selects exist in the codebase.

---

## Code Examples

Verified patterns from existing codebase:

### Existing Header Pattern (to be replaced)
```typescript
// src/components/calculators/CalculatorLayout.tsx (current)
<div className="mb-10 text-center">
  {icon && (
    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-accent/10 border border-accent/20">
      {icon}
    </div>
  )}
  <h1 className="mb-3 text-page-title text-foreground leading-tight">{title}</h1>
  <p className="mx-auto max-w-2xl text-lead text-muted-foreground">{description}</p>
</div>
```

### New Header Pattern (Phase 59 target — no icon, no hero treatment)
```typescript
// ToolPageLayout header section
<div className="mb-10">
  <h1 className="mb-3 text-h1 text-foreground leading-tight">{title}</h1>
  <p className="max-w-2xl text-lead text-muted-foreground">{description}</p>
</div>
```

Note: `text-h1` (not `text-page-title`) — tool titles are page-level headings but not hero-scale. `text-page-title` is used on homepage hero; tools are functional utilities.

### Glass Card for Result Area (Phase 58 pattern)
```typescript
// Using Card component established in Phase 58
<Card variant="glassLight" size="md">
  {/* result content */}
</Card>
// OR directly:
<div className="glass-card-light card-padding">
  {/* result content */}
</div>
```

### Two-Column Grid Layout
```typescript
// For form-heavy tools (form gets more space than result)
<div className="grid gap-6 lg:grid-cols-[3fr_2fr] items-start">
  <div>{formSlot}</div>
  <div>{resultSlot ?? placeholder}</div>
</div>

// For balanced tools (JSON formatter, meta-tag generator)
<div className="grid gap-6 lg:grid-cols-2 items-start">
  <div>{formSlot}</div>
  <div>{resultSlot ?? placeholder}</div>
</div>
```

### Tools Index Card Upgrade (TOOL-04)

Current (needs upgrade):
```typescript
// tools/page.tsx — current
<div className="group flex flex-col p-8 rounded-xl bg-surface-raised border border-border hover:border-border-strong transition-colors">
```

Target (Phase 58 glass-card-light):
```typescript
// Use Card variant="glassLight" with hover
<Card variant="glassLight" size="lg" hover={true} className="group flex flex-col">
```

### Action Bar Pattern
```typescript
// Inside ToolPageLayout result card header
<div className="flex items-center justify-between mb-4">
  <h2 className="text-h4 text-foreground">Results</h2>
  {actions && actions.length > 0 && (
    <div className="flex items-center gap-1">
      {actions.map(action => (
        <Button key={action.type} variant="ghost" size="sm" onClick={action.onClick}>
          {/* action-specific Lucide icon */}
          <span className="sr-only">{action.label}</span>
        </Button>
      ))}
    </div>
  )}
</div>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `CalculatorLayout` with icon slot | `ToolPageLayout` with title+subtitle only | Phase 59 | Cleaner, less visual noise |
| Full-width single-column for all tools | Per-tool `columns` decision | Phase 59 | Better UX for complex calculators |
| Results inline below form, no placeholder | Dedicated result pane with placeholder in two-column | Phase 59 | User knows where results will appear |
| `bg-surface-raised border-border` tool cards on index | `glass-card-light` with hover | Phase 59 | Consistent with Phase 58 card system |
| Hardcoded `<select>` in mortgage/cost estimator | shadcn `Select` component | Phase 59 (TOOL-02) | Form field consistency |

**Deprecated/outdated:**
- `CalculatorLayout` icon prop: removed from new layout — CONTEXT.md locked decision
- `CalculatorLayout` trust signals section (at bottom): removed — these were "Growing / 98% / Free" stats; not part of new clean layout
- `text-page-title` class for tool page h1: downgrade to `text-h1` — `text-page-title` is hero scale (clamp up to 4rem); tool headers are functional, not marketing

---

## Open Questions

1. **TTL Calculator internal layout preservation**
   - What we know: `Calculator.tsx` uses `lg:grid-cols-3` (2/3 form, 1/3 result) — already two-column
   - What's unclear: Whether to wrap the whole `Calculator.tsx` in `ToolPageLayout` or just update the header section inside `Calculator.tsx`
   - Recommendation: Update the header section inside `Calculator.tsx` to match `ToolPageLayout` header styling. Do not force `ToolPageLayout` slot API on TTL — its `InputPanel`/`ResultsPanel` architecture is significantly more complex than a simple form+result split.

2. **JSON Formatter two-column layout**
   - What we know: JSON formatter has input textarea + formatted output textarea — side by side is a common pattern for code formatters
   - What's unclear: Whether the user confirmed two-column for JSON formatter specifically (context only confirmed the general criterion)
   - Recommendation: Use two-column. The input/output side-by-side pattern is canonical for formatter tools and avoids scroll to see output.

3. **`CalculatorResults` email capture in result slot**
   - What we know: ROI and Mortgage use `CalculatorResults` which includes an email capture form after results
   - What's unclear: Whether to keep the email capture or consider it "trust signal" territory (which was removed from header)
   - Recommendation: Keep the email capture — it's functionality (lead capture), not decorative trust signal. Phase 59 is layout-only; removing it changes functionality which is out of scope.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | bun:test (unit) + Playwright (E2E) |
| Config file | `tests/setup.ts` (unit), `playwright.config.ts` (E2E) |
| Quick run command | `bun test tests/unit/components.test.tsx` |
| Full suite command | `bun test tests/` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TOOL-01 | All tool pages render h1 with tool title + muted description below | unit | `bun test tests/unit/tool-page-layout.test.tsx` | No — Wave 0 |
| TOOL-01 | ToolPageLayout renders header without icon slot | unit | `bun test tests/unit/tool-page-layout.test.tsx` | No — Wave 0 |
| TOOL-02 | CalculatorInput renders label above input, help text below | unit | `bun test tests/unit/components.test.tsx` (extend) | Partial — CalculatorInput not yet tested |
| TOOL-02 | Input error state uses `text-destructive` below field | unit | `bun test tests/unit/components.test.tsx` (existing) | Partial — Phase 58 tests cover Input aria-invalid |
| TOOL-03 | Result card renders with glass-card-light class | unit | `bun test tests/unit/tool-page-layout.test.tsx` | No — Wave 0 |
| TOOL-03 | Action buttons render only when actions configured | unit | `bun test tests/unit/tool-page-layout.test.tsx` | No — Wave 0 |
| TOOL-04 | Tools index page renders tool cards | E2E | `bun run test:e2e:fast -- --grep "Tools Index"` | Yes — `e2e/tools.spec.ts` |
| TOOL-04 | Tool cards use glass card styling | unit | `bun test tests/unit/server-components.test.tsx` (extend) | Partial |

### Sampling Rate
- **Per task commit:** `bun test tests/unit/tool-page-layout.test.tsx` (new file) + `bun test tests/unit/components.test.tsx`
- **Per wave merge:** `bun test tests/`
- **Phase gate:** Full suite green (394+ tests) before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/unit/tool-page-layout.test.tsx` — covers TOOL-01 (header renders without icon), TOOL-03 (result card glass class, action bar conditional rendering), layout column behavior
- [ ] No framework install needed — bun:test already configured

---

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection — all 13 tool pages, `CalculatorLayout.tsx`, `CalculatorInput.tsx`, `Calculator.tsx`, `ResultsPanel.tsx`, `globals.css`, `card.tsx`, `button.tsx`, `input.tsx`
- `tests/unit/components.test.tsx` — existing Phase 58 test patterns for component styling assertions
- `e2e/tools.spec.ts` — existing E2E smoke tests for tools pages

### Secondary (MEDIUM confidence)
- Phase 58 summary (`58-01-SUMMARY.md`) — confirmed `glass-card-light`, `bg-surface-sunken`, `aria-invalid` patterns established in Phase 58
- `globals.css` — confirmed all token names (`text-h1`, `text-lead`, `glass-card-light`, `card-padding`, `space-y-comfortable`) are defined
- CONTEXT.md user decisions — locked decisions verified against codebase for feasibility

### Tertiary (LOW confidence)
- Two-column layout decisions for JSON formatter and meta-tag generator — inferred from UX convention, not user-confirmed

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all tokens, components, and patterns verified in codebase
- Architecture: HIGH — existing `CalculatorLayout` structure analyzed; `ToolPageLayout` design is incremental evolution
- Pitfalls: HIGH — TTL special case and Style A/B integration patterns verified by direct file inspection
- Column decisions: MEDIUM — most are clear; JSON formatter and meta-tag generator are inferred

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (stable — no external dependencies)
