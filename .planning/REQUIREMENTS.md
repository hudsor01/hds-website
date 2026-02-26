# Requirements: v4.0 UI Redesign

**Defined:** 2026-02-25
**Core Value:** Working tools and contact form stay functional while the codebase achieves production-grade quality: strict types, comprehensive test coverage, proper error handling, visual correctness, and accessible to all users.

## v4.0 Requirements

### DSYS — Design System Foundation

- [ ] **DSYS-01**: CSS custom properties in `globals.css` fully overhauled — complete token system covering brand colors, neutral grays, spacing scale, radius, shadows, and surface variants
- [ ] **DSYS-02**: Brand color palette defined using OKLCH — primary, accent, and neutral sequences that are distinct from shadcn defaults
- [ ] **DSYS-03**: Typography scale defined — heading sizes (h1–h4), body sizes, monospace, letter spacing, line heights, and font weight tokens — applied consistently across the site
- [ ] **DSYS-04**: Surface/card elevation tokens defined — background, card, elevated, overlay levels with corresponding border and shadow tokens
- [ ] **DSYS-05**: Tailwind config extends theme with design tokens — no scattered hardcoded hex/rgb values in new token definitions

### HERO — Homepage & Value Proposition

- [x] **HERO-01**: Homepage hero section has a distinctive, non-generic background treatment (gradient, subtle texture, or purposeful dark/light contrast)
- [x] **HERO-02**: Hero headline has clear typographic hierarchy — primary claim + supporting statement visually distinct in size and weight
- [x] **HERO-03**: Hero CTAs are polished with distinct visual weight — primary action clearly differentiated from secondary
- [x] **HERO-04**: Page sections have deliberate vertical rhythm — whitespace, section transitions, and content density feel intentional

### COMP — Core Component Polish

- [ ] **COMP-01**: Button component has distinct, polished variants — primary (brand color), secondary (outlined or muted), ghost (text-only) — all with proper hover/focus/active states
- [ ] **COMP-02**: Form inputs and textareas have consistent styling — focus ring, label positioning, placeholder treatment, error state, disabled state
- [ ] **COMP-03**: Card component is visually distinct from page background — clear border/shadow/surface treatment with consistent padding
- [ ] **COMP-04**: Navbar is polished — proper backdrop treatment, link hover states, active indicator, mobile menu consistency

### TOOL — Tool Page Polish

- [ ] **TOOL-01**: All tool pages have a consistent header treatment — tool title, description, and clear framing (not just a raw form)
- [ ] **TOOL-02**: Tool form fields are styled to the design system — not generic browser defaults or unstyled shadcn components
- [ ] **TOOL-03**: Tool output/results display has dedicated, polished presentation — result cards, data labels, print/download action styling
- [ ] **TOOL-04**: Tools index page has a polished grid layout matching the design system card treatment

### PAGE — Content Page Polish

- [ ] **PAGE-01**: Services page feels like a premium landing page — clear service sections, visual hierarchy, and CTAs
- [ ] **PAGE-02**: About page communicates trust and expertise — consistent with overall brand aesthetic
- [ ] **PAGE-03**: Location page template is polished — local focus, service area, contact pathways
- [ ] **PAGE-04**: Contact page has a balanced, professional layout — form + contact info clearly structured

## Out of Scope

| Feature | Reason |
|---------|--------|
| Animations / transitions | Static quality first; animations are a separate milestone concern |
| Framework or library swap | Stay with Tailwind + shadcn; redesign through CSS tokens and overrides only |
| New pages or features | UI polish only — no new page types or tool functionality |
| Mobile-only redesign | All pages are responsive; no mobile-exclusive UI components |
| Dark mode redesign | Improve tokens that affect dark mode, but no dark-mode-exclusive work |

## Traceability

Which phases cover which requirements.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DSYS-01 | Phase 56 | Pending |
| DSYS-02 | Phase 56 | Pending |
| DSYS-03 | Phase 56 | Pending |
| DSYS-04 | Phase 56 | Pending |
| DSYS-05 | Phase 56 | Pending |
| HERO-01 | Phase 57 | Complete |
| HERO-02 | Phase 57 | Complete |
| HERO-03 | Phase 57 | Complete |
| HERO-04 | Phase 57 | Complete |
| COMP-01 | Phase 58 | Pending |
| COMP-02 | Phase 58 | Pending |
| COMP-03 | Phase 58 | Pending |
| COMP-04 | Phase 58 | Pending |
| TOOL-01 | Phase 59 | Pending |
| TOOL-02 | Phase 59 | Pending |
| TOOL-03 | Phase 59 | Pending |
| TOOL-04 | Phase 59 | Pending |
| PAGE-01 | Phase 60 | Pending |
| PAGE-02 | Phase 60 | Pending |
| PAGE-03 | Phase 60 | Pending |
| PAGE-04 | Phase 60 | Pending |

**Coverage:**
- v4.0 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0 ✅

---
*Requirements defined: 2026-02-25*
