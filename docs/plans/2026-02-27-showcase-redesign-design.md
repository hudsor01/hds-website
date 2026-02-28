# Showcase Page Redesign — Editorial Mosaic

**Goal:** Replace the plain gray card headers with a color-identity system and fix the mobile carousel pattern.

**Architecture:** Minimal — two files change. No new components, no new data layer queries.

**Tech Stack:** Tailwind CSS, Next.js 15 App Router, existing `card.tsx` + `showcase/page.tsx`

---

## Design Decisions

### Image strategy: Hybrid
Text-first permanently. If `imageUrl` is present on a showcase item, use it as the card header background. When absent (current state for all items), use a project-specific color panel with large typographic title. This looks intentional, not broken.

### Layout changes
- **Mobile:** Drop horizontal scroll carousel → single-column stacked grid
- **Desktop:** Keep 2-col grid; featured items span full width (`col-span-2`)

### Card structure
```
┌──────────────────────────────────────────────────┐
│  PROJECT COLOR PANEL  (h-52 regular / h-64 featured)
│                                                  │
│  INDUSTRY LABEL  ← small, uppercase, spaced      │
│  PROJECT TITLE   ← bold, 2xl, white on color     │
│  [Case Study] or [Portfolio] badge               │
│                                                  │
│  (if imageUrl: image as bg-cover instead)        │
├──────────────────────────────────────────────────┤
│  Description (2-line clamp, muted)               │
│                                                  │
│  Metric A   ·   Metric B   ·   Metric C          │
│  (max 3, large numbers, inline)                  │
│                                                  │
│  [Tech] [Stack] [Chips]          View →          │
└──────────────────────────────────────────────────┘
```

**Hover:** shadow deepens, color panel gets `brightness-110`, "View →" shifts 2px right.

### Color identity system
Mapped from `industry` (lowercased). Full static class strings for Tailwind scanning.

| Industry | Panel | Text |
|---|---|---|
| Tattoo Studio | `bg-amber-800` | `text-amber-50` |
| Property Management SaaS | `bg-blue-900` | `text-blue-50` |
| Personal Brand | `bg-teal-800` | `text-teal-50` |
| Default | `bg-slate-800` | `text-slate-50` |

### Badge differentiation
- `showcaseType === 'detailed'` → amber pill "Case Study"
- `showcaseType === 'quick'` → muted gray pill "Portfolio"

### New props on ProjectCardProps
- `industry?: string` — drives color identity lookup
- `showcaseType?: 'quick' | 'detailed'` — drives badge

## Files Changed
1. `src/components/ui/card.tsx` — redesign `variant="project"` card
2. `src/app/showcase/page.tsx` — pass new props, fix grid (drop carousel)

## Out of Scope
- `/showcase/[slug]` detail pages
- Data layer (`src/lib/showcase.ts`)
- All other card variants
