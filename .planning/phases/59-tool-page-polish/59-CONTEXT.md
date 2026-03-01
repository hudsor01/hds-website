# Phase 59: Tool Page Polish - Context

**Gathered:** 2026-03-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Apply a consistent, professional layout across all 13 tool pages: polished header section, design-system-styled form fields, and a dedicated output/result presentation area. Tool logic and functionality are unchanged. Shared layout component enforces consistency across all tools.

</domain>

<decisions>
## Implementation Decisions

### Header section
- Title + subtitle only — no icons, breadcrumbs, trust signals, or CTAs
- Header sits below the navbar, inside the page content area (not hero-style)
- Background treatment: Claude's discretion (align with Phase 58 glass/card system)

### Layout structure
- Desktop: Use two-column layout (form left, result right) when it prevents the user from having to scroll to see results; use single-column (stacked) for simpler tools where two-column doesn't improve UX
- Mobile: Claude's discretion — single-column stacked is the safe default
- All 13 tools share a single `ToolPageLayout` component with slot-based customization — tools pass form and result content as children/slots
- Result area before submit: empty placeholder state with a descriptive prompt (e.g., "Fill in the form to generate your paystub")

### Result/output display
- Output is contained in a card with a clear visual boundary (consistent with Phase 58 glass-card patterns)
- Actions available on the result card: Copy to clipboard, Download, Print, Reset/clear form
- Actions are declared per-tool in the layout config — only shown where applicable to that tool's output type
- No loading state — results appear instantly after submit (submit button loading state via useFormStatus handles in-flight indication)

### Form field treatment
- Labels sit above inputs
- Validation errors: displayed below the field in red text, triggered on form submit (not on blur)
- Help text: optional muted text below the label, used where the field needs explanation
- Submit button placement: Claude's discretion based on form length and mobile UX

### Claude's Discretion
- Header background treatment (gradient, glass, or plain — align with Phase 58 tokens)
- Mobile layout specifics
- Submit button positioning strategy
- Exact spacing, typography sizing, and component variants within the design system

</decisions>

<specifics>
## Specific Ideas

- Two-column layout decision is per-tool: the primary criterion is "does the user need to scroll to see results?" — if yes, use two-column
- Result card actions are configured per-tool, not defaulted to all tools globally

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 59-tool-page-polish*
*Context gathered: 2026-03-01*
