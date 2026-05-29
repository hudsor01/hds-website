/**
 * Shared types for the global command palette (audit #263).
 *
 * The palette indexes static surfaces (tools, top-level public routes) and
 * dynamic surfaces (recent blog posts, showcase items) into a single uniform
 * shape so the client component renders one CommandGroup per group with no
 * type narrowing at render time.
 */

export type PaletteGroup = 'Tools' | 'Pages' | 'Blog' | 'Showcase'

export interface PaletteEntry {
	/** Stable unique id used as React key + cmdk value. Format: `<kind>:<slug>`. */
	readonly id: string
	/** Visible label rendered in the CommandItem. */
	readonly label: string
	/** Optional secondary text rendered below the label. */
	readonly description?: string
	/** Internal href passed to router.push on select. */
	readonly href: string
	readonly group: PaletteGroup
	/** Extra search terms beyond label + description. */
	readonly keywords?: readonly string[]
}

export interface PaletteData {
	readonly staticEntries: readonly PaletteEntry[]
	readonly dynamicEntries: readonly PaletteEntry[]
}
