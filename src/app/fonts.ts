import { Hanken_Grotesk, JetBrains_Mono, Roboto_Serif } from 'next/font/google'

// Shared by layout.tsx and global-not-found.tsx. global-not-found renders
// its own <html>/<body> outside the root layout, so without these variable
// classes on its <body> `--font-hanken-grotesk` / `--font-roboto-serif` are
// undefined and the page falls back to Tailwind's preflight font stack.

// Weight inventory across all utility classes (font-normal, font-medium,
// font-semibold, font-bold, font-black) gives 400/500/600/700/900. Variable
// fonts subset the binary when `weight` is provided, cutting download size
// vs. shipping the full wght axis (100-900).

const hankenGrotesk = Hanken_Grotesk({
	variable: '--font-hanken-grotesk',
	subsets: ['latin'],
	weight: ['400', '500', '600', '700', '900'],
	display: 'swap',
	preload: true,
	adjustFontFallback: true
})

const robotoSerif = Roboto_Serif({
	variable: '--font-roboto-serif',
	subsets: ['latin'],
	weight: ['400', '600', '700', '900'],
	display: 'swap',
	preload: true,
	adjustFontFallback: true
})

// adjustFontFallback off for mono: the ui-monospace fallback is already
// metric-compatible with JetBrains Mono and the code blocks that consume
// it are never above the fold, so the synthesized fallback @font-face
// is dead weight.
const jetbrainsMono = JetBrains_Mono({
	variable: '--font-jetbrains-mono',
	subsets: ['latin'],
	weight: ['400'],
	display: 'swap',
	preload: false,
	adjustFontFallback: false
})

export const fontVariables = `${hankenGrotesk.variable} ${robotoSerif.variable} ${jetbrainsMono.variable}`
