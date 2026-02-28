# Showcase Card Redesign — Editorial Mosaic Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the plain gray card headers with a per-project color identity system and fix the mobile carousel layout.

**Architecture:** Two files change — `src/components/ui/card.tsx` (variant="project" only) and `src/app/showcase/page.tsx` (grid layout + new prop passing). One test file updates. No new files, no data layer changes.

**Tech Stack:** React 19, TypeScript strict, Tailwind CSS, Next.js 15 App Router, bun:test + @testing-library/react

---

### Task 1: Add color identity helper + update ProjectCardProps

**Files:**
- Modify: `src/components/ui/card.tsx` (lines 83-93 for interface, before line 178 for helper)
- Test: `tests/unit/project-card.test.tsx`

**Step 1: Write failing tests**

In `tests/unit/project-card.test.tsx`, add these tests inside the `describe('ProjectCard', ...)` block after the last existing test:

```tsx
test('renders Case Study badge when showcaseType is detailed', () => {
  const { container } = render(
    <Card {...defaultProps} showcaseType="detailed" />
  )
  expect(container.textContent).toContain('Case Study')
})

test('renders Portfolio badge when showcaseType is quick', () => {
  const { container } = render(
    <Card {...defaultProps} showcaseType="quick" />
  )
  expect(container.textContent).toContain('Portfolio')
})

test('does not render type badge when showcaseType is not provided', () => {
  const { container } = render(<Card {...defaultProps} />)
  expect(container.textContent).not.toContain('Case Study')
  expect(container.textContent).not.toContain('Portfolio')
})

test('card header uses amber color class for Tattoo Studio industry', () => {
  const { container } = render(
    <Card {...defaultProps} industry="Tattoo Studio" showcaseType="detailed" />
  )
  const header = container.querySelector('[data-testid="card-header"]')
  expect(header?.className).toContain('bg-amber-800')
})

test('card header uses blue color class for Property Management SaaS industry', () => {
  const { container } = render(
    <Card {...defaultProps} industry="Property Management SaaS" showcaseType="detailed" />
  )
  const header = container.querySelector('[data-testid="card-header"]')
  expect(header?.className).toContain('bg-blue-900')
})

test('card header uses teal color class for Personal Brand industry', () => {
  const { container } = render(
    <Card {...defaultProps} industry="Personal Brand" showcaseType="quick" />
  )
  const header = container.querySelector('[data-testid="card-header"]')
  expect(header?.className).toContain('bg-teal-800')
})

test('card header uses slate fallback color for unknown industry', () => {
  const { container } = render(
    <Card {...defaultProps} industry="Unknown Industry" showcaseType="quick" />
  )
  const header = container.querySelector('[data-testid="card-header"]')
  expect(header?.className).toContain('bg-slate-800')
})
```

**Step 2: Run tests to verify they fail**

```bash
bun test tests/unit/project-card.test.tsx
```

Expected: 7 new tests FAIL ("showcaseType" and "industry" props don't exist on the type, `data-testid` not present on header)

**Step 3: Update ProjectCardProps interface**

In `src/components/ui/card.tsx`, find the `ProjectCardProps` interface (line 83) and replace:

```tsx
// FIND (lines 83-93):
interface ProjectCardProps extends Omit<BaseCardProps, 'variant'> {
	variant: 'project'
	id: string
	slug: string
	title: string
	description: string
	category: string
	featured?: boolean
	stats?: Record<string, string>
	tech_stack: string[]
}

// REPLACE WITH:
interface ProjectCardProps extends Omit<BaseCardProps, 'variant'> {
	variant: 'project'
	id: string
	slug: string
	title: string
	description: string
	category: string
	industry?: string
	showcaseType?: 'quick' | 'detailed'
	featured?: boolean
	stats?: Record<string, string>
	tech_stack: string[]
}
```

**Step 4: Add color identity helper**

Find the line `const Card = React.forwardRef` and insert this block DIRECTLY BEFORE it:

```tsx
// ── Project card color identity ─────────────────────────────────────────────
const PROJECT_COLORS: Record<string, { header: string; text: string }> = {
	'tattoo studio': { header: 'bg-amber-800', text: 'text-amber-50' },
	'property management saas': { header: 'bg-blue-900', text: 'text-blue-50' },
	'personal brand': { header: 'bg-teal-800', text: 'text-teal-50' },
}
const DEFAULT_PROJECT_COLOR = { header: 'bg-slate-800', text: 'text-slate-50' }

function getProjectColors(
	industry: string | null | undefined,
	category: string | null | undefined
): { header: string; text: string } {
	const key = (industry ?? category ?? '').toLowerCase()
	return PROJECT_COLORS[key] ?? DEFAULT_PROJECT_COLOR
}
// ────────────────────────────────────────────────────────────────────────────
```

**Step 5: Run tests — still failing (interface added but card doesn't use new props yet)**

```bash
bun test tests/unit/project-card.test.tsx
```

Expected: color/badge tests still fail (no `data-testid`, no badge render). Type errors resolved.

---

### Task 2: Redesign the project card header + body

**Files:**
- Modify: `src/components/ui/card.tsx` (lines 299–410 — the full project card render block)

**Step 1: Replace the entire project card render block**

Find this block (starts at line 299):
```tsx
if ('variant' in props && props.variant === 'project') {
```
...and ends at line 410 with the closing `}` after the card's return.

Replace the entire block (lines 299–410) with:

```tsx
	if ('variant' in props && props.variant === 'project') {
		const {
			id: _id,
			slug,
			title,
			description,
			category,
			industry,
			showcaseType,
			featured = false,
			stats = {},
			tech_stack
		} = props as ProjectCardProps

		const colors = getProjectColors(industry, category)
		const metricEntries = Object.entries(stats).slice(0, 3)

		return (
			<div
				ref={ref}
				className={cn(
					'group relative',
					featured && 'md:col-span-2',
					className
				)}
			>
				<Link href={`/showcase/${slug}`}>
					<div
						className={cn(
							cardVariants({ variant: 'glass', size: 'none', hover: true }),
							'h-full overflow-hidden'
						)}
					>
						{/* Project Header — color identity panel */}
						<div
							data-testid="card-header"
							className={cn(
								'relative overflow-hidden border-b border-border',
								featured ? 'h-80' : 'h-64',
								colors.header
							)}
						>
							<div className="relative z-10 card-padding-lg h-full flex flex-col justify-between py-6">
								{/* Top: industry/category eyebrow */}
								<p
									className={cn(
										'text-xs font-semibold uppercase tracking-widest opacity-60',
										colors.text
									)}
								>
									{category}
								</p>

								{/* Mid: project title */}
								<h3
									className={cn(
										'text-2xl lg:text-3xl font-black leading-tight',
										colors.text
									)}
								>
									{title}
								</h3>

								{/* Bottom: type badge */}
								{showcaseType && (
									<div>
										<span
											className={cn(
												'inline-block px-3 py-1 rounded-full text-xs font-semibold border',
												showcaseType === 'detailed'
													? 'bg-accent/20 text-accent border-accent/30'
													: 'bg-white/10 border-white/20 text-white/70'
											)}
										>
											{showcaseType === 'detailed' ? 'Case Study' : 'Portfolio'}
										</span>
									</div>
								)}
							</div>

							{/* Hover overlay */}
							<div className="absolute inset-0 bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-center z-20">
								<Button
									variant="default"
									size="lg"
									className="transform hover:scale-105 will-change-transform transform-gpu"
								>
									View Project
									<ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
								</Button>
							</div>
						</div>

						{/* Project Details */}
						<div className="card-padding-lg flex flex-col gap-4">
							{/* Description — 2-line clamp */}
							<p className="text-muted-foreground leading-relaxed line-clamp-2">
								{description}
							</p>

							{/* Inline metrics — max 3 */}
							{metricEntries.length > 0 && (
								<div className="flex items-start gap-6 flex-wrap">
									{metricEntries.map(([key, value]) => (
										<div key={key}>
											<div className="text-xl font-black text-foreground">
												{value}
											</div>
											<div className="text-xs text-muted-foreground capitalize">
												{key.replace(/([A-Z])/g, ' $1').trim()}
											</div>
										</div>
									))}
								</div>
							)}

							{/* Tech stack — max 5 chips */}
							{tech_stack.length > 0 && (
								<div className="flex flex-wrap gap-1.5">
									{tech_stack.slice(0, 5).map(tech => (
										<span
											key={tech}
											className="px-2.5 py-0.5 bg-muted border border-border rounded-full text-xs text-muted-foreground"
										>
											{tech}
										</span>
									))}
								</div>
							)}
						</div>
					</div>
				</Link>
			</div>
		)
	}
```

**Step 2: Run all card tests**

```bash
bun test tests/unit/project-card.test.tsx
```

Expected: Most pass. Two tests will fail:
1. `renders featured badge when featured is true` — "Featured Project" text is removed (intentional)
2. `does not render stats grid when no stats provided` — `.grid.grid-cols-3` no longer exists anywhere (test may actually PASS since querySelector returns null, which is falsy ✓)

---

### Task 3: Update broken tests

**Files:**
- Modify: `tests/unit/project-card.test.tsx`

**Step 1: Update the featured badge test**

Find:
```tsx
test('renders featured badge when featured is true', () => {
  const { container } = render(<Card {...defaultProps} featured={true} />);
  expect(within(container).getByText('Featured Project')).toBeTruthy();
});
```

Replace with:
```tsx
test('featured card spans full width with md:col-span-2', () => {
  const { container } = render(<Card {...defaultProps} featured={true} />)
  const wrapper = container.querySelector('.md\\:col-span-2')
  expect(wrapper).toBeTruthy()
})
```

Note: `applies featured class when featured is true` already tests this — so you can also just DELETE the old featured badge test entirely and leave `applies featured class when featured is true` as-is. Either works.

**Step 2: Run all card tests to verify green**

```bash
bun test tests/unit/project-card.test.tsx
```

Expected: All pass.

**Step 3: Run full test suite to check for regressions**

```bash
bun test tests/
```

Expected: All 387+ tests pass.

**Step 4: Commit**

```bash
git add src/components/ui/card.tsx tests/unit/project-card.test.tsx
git commit -m "feat(showcase): editorial mosaic card — color identity + badge system"
```

---

### Task 4: Fix showcase page grid + pass new props

**Files:**
- Modify: `src/app/showcase/page.tsx` (line 75 — the project grid div)

**Step 1: Fix the grid container — remove carousel, add clean grid**

Find (line 75):
```tsx
<div className="md:grid md:grid-cols-2 md:gap-6 mb-16 flex overflow-x-auto snap-x snap-mandatory scrollbar-hide md:overflow-visible -mx-4 px-4 md:mx-0 md:px-0 space-x-4 md:space-x-0">
```

Replace with:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
```

**Step 2: Pass `industry` and `showcaseType` to each Card**

Find the `<Card` usage in the `items.map(item => ...)` block:

```tsx
// FIND:
<Card
  key={item.id}
  variant="project"
  id={item.id}
  slug={item.slug}
  title={item.title}
  description={item.description}
  category={item.category ?? item.industry ?? 'Project'}
  featured={item.featured}
  stats={item.metrics}
  tech_stack={item.technologies}
/>

// REPLACE WITH:
<Card
  key={item.id}
  variant="project"
  id={item.id}
  slug={item.slug}
  title={item.title}
  description={item.description}
  category={item.category ?? item.industry ?? 'Project'}
  industry={item.industry ?? undefined}
  showcaseType={item.showcaseType}
  featured={item.featured}
  stats={item.metrics}
  tech_stack={item.technologies}
/>
```

**Step 3: Run full test suite**

```bash
bun test tests/
```

Expected: All tests pass.

**Step 4: Typecheck**

```bash
bun run typecheck
```

Expected: 0 errors.

**Step 5: Commit**

```bash
git add src/app/showcase/page.tsx
git commit -m "feat(showcase): grid layout — drop carousel, pass industry + showcaseType props"
```

---

### Task 5: Final verification

**Step 1: Run full test suite**

```bash
bun test tests/
```

Expected: All pass.

**Step 2: Lint**

```bash
bun run lint
```

Expected: No errors or warnings.

**Step 3: Build**

```bash
bun run build
```

Expected: Successful build, no TypeScript errors.

**Step 4: Visual check in browser**

Navigate to `http://localhost:3002/showcase` and verify:
- Ink 37 Tattoos card: amber header (`bg-amber-800`), "Case Study" badge
- TenantFlow card: blue header (`bg-blue-900`), "Case Study" badge
- richard-hudson-jr card: teal header (`bg-teal-800`), "Portfolio" badge
- Mobile: single column stacked (no horizontal scroll)
- Desktop: 2-col grid; featured items full width
- Hover: color panel brightens, "View Project" button appears

**Step 5: Final commit if any cleanup needed**

```bash
git add -A
git commit -m "fix(showcase): post-verification cleanup"
```
