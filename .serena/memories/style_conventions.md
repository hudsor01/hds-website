# Style and conventions

- No emojis in repo content unless explicitly requested.
- Prettier: tabs (width 2), single quotes, no semicolons.
- TypeScript strict; avoid any; validate inputs with Zod safeParse.
- Server Components by default; add "use client" only for hooks/events/browser APIs.
- Use src/lib/logger instead of console.*
- Tailwind-first styling; prefer semantic utilities and CSS custom properties.
- Simplicity first (YAGNI), composition over inheritance, single responsibility modules.
- Accessibility: semantic HTML, aria attributes, visible focus states.
- Imports grouped (types, React, third-party, local); constants before components.