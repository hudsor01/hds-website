/**
 * Button style variants + props type, extracted into a server-safe
 * module so server components can import `buttonVariants` without
 * crossing the client boundary.
 *
 * Background: `src/components/ui/button.tsx` is `'use client'` (Button
 * uses `@radix-ui/react-slot` via `asChild`, which requires the client
 * runtime). When `buttonVariants` lived in that same file, importing
 * it from a server component (e.g. shadcn `<PaginationLink>` from
 * `@/components/ui/pagination`, which is itself server-renderable)
 * tripped Next.js's "Attempted to call buttonVariants() from server
 * in a Server Component" error -- the function was tagged client-only
 * by being exported from a `'use client'` module, even though the
 * function body is pure (no client APIs).
 *
 * The `cva()` config + `ButtonProps` type live here (no `'use client'`).
 * `button.tsx` re-exports both so existing imports keep working;
 * shadcn primitives that need only the variants (e.g. `pagination.tsx`)
 * should import from here directly to avoid pulling the client Button
 * into a server render path.
 */
import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'

/**
 * One button API (M5). Every size shares the radius, the weight and the
 * 44px minimum height (the same touch target the global `button` rule
 * gives a native <button>, so an `asChild` link renders the same box).
 * Text steps 14 / 14 / 16 / 18px; padding is fixed per size, with or
 * without an icon. Focus is the global :focus-visible outline. Fills
 * that carry light text (default, destructive, success) only lighten
 * to /90 on hover and /85 when pressed, so the label keeps 4.5:1 in
 * every state (WCAG 1.4.3).
 */
export const buttonVariants = cva(
	"inline-flex min-h-11 shrink-0 items-center justify-center gap-tight whitespace-nowrap rounded-md text-sm font-semibold transition-smooth disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:outline-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default:
					'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:bg-primary/85',
				destructive:
					'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:bg-destructive/85',
				success:
					'bg-success text-success-foreground shadow-sm hover:bg-success/90 active:bg-success/85',
				accent:
					'bg-accent text-accent-foreground shadow-sm hover:bg-accent/85 active:bg-accent/75',
				outline:
					'border border-border bg-background text-foreground shadow-xs hover:bg-accent hover:text-accent-foreground active:bg-accent/15',
				'outline-strong':
					'border-2 border-foreground/25 bg-background text-foreground shadow-xs hover:border-accent hover:bg-accent hover:text-accent-foreground active:bg-accent/15',
				secondary:
					'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 active:bg-secondary/70',
				muted:
					'bg-muted text-muted-foreground hover:bg-muted/80 active:bg-muted/70',
				ghost: 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
				link: 'text-primary underline-offset-4 hover:underline'
			},
			size: {
				default: 'h-9 px-4',
				sm: 'h-8 gap-1.5 px-3',
				lg: 'h-12 px-6 text-base',
				xl: 'h-12 px-8 text-lg',
				icon: 'size-9',
				'icon-sm': 'size-8',
				'icon-lg': 'size-10'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	}
)

export interface ButtonProps
	extends React.ComponentProps<'button'>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean
}
