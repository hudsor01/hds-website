import { Hanken_Grotesk, JetBrains_Mono, Roboto_Serif } from 'next/font/google'

// Shared by layout.tsx, global-not-found.tsx and global-error.tsx, which
// each render their own <html>. The variable classes go on <html>, so
// `--font-hanken-grotesk` etc. resolve at :root, where the @theme font
// tokens (--font-sans, --font-display, --font-mono) are declared. On
// <body> they were undefined at :root and <html> fell back to the system
// stack.

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
