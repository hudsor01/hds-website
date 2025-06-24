# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hudson Digital Website - A Vue 3 + TypeScript SPA built with Vite, using Tailwind CSS v4 and Naive UI components.

## Essential Commands

```bash
# Development
npm run dev          # Start dev server on http://localhost:5180

# Build
npm run build        # Type check with vue-tsc, then build with Vite
npm run preview      # Preview production build locally

# Install dependencies
npm install
```

## Architecture

### Tech Stack
- **Framework**: Vue 3.5 with Composition API
- **Build Tool**: Vite 6.3
- **Language**: TypeScript 5.8 (strict mode)
- **Styling**: Tailwind CSS v4 + Naive UI
- **Routing**: Vue Router 4

### Path Aliases
```typescript
@ -> /src
@/components -> /src/components
@/pages -> /src/pages
@/router -> /src/router
@/types -> /src/types
```

### Key Patterns
1. **Page Components**: Located in `src/pages/`, imported dynamically in router
2. **Layout Components**: `Navbar.vue` and `Footer.vue` in `src/components/layout/`
3. **Styling**: Tailwind utilities with extensive custom theme configuration
4. **No Testing**: Project has no test framework configured
5. **No Linting**: No ESLint setup - rely on TypeScript and Prettier

## Design System: "Elevated Cards"

The site follows an elevated card design system with floating elements and layered depth.

### Card Classes
- **Primary Cards**: `bg-white rounded-2xl shadow-lg border border-gray-100`
- **Interactive Cards**: Add `hover:shadow-xl hover:-translate-y-1 transition-all duration-300`
- **Logo Containers**: `bg-white rounded-2xl shadow-lg border border-gray-100 p-4`

### Color Palette

#### Core Colors
- **Primary (Midnight Black)**: `#09090b` to `#fafafa` - Authority & power
- **Secondary (Electric Cyan)**: `#22d3ee` (400) / `#0891b2` (600) - Innovation & energy  
- **Accent (Neon Green)**: `#4ade80` (400) / `#16a34a` (600) - Success & growth
- **Warning (Electric Orange)**: `#fb923c` (400) / `#ea580c` (600) - Energy & action
- **Purple**: `#c084fc` (400) / `#9333ea` (600) - Premium & luxury

#### Background Colors
- **Main Background**: `#f8fafc` (gray-50)
- **Cards**: `#ffffff` (white)
- **Dark Sections**: Gradient combinations using primary-950

#### Glow Effects (Refined)
- **Subtle glow**: 4px primary, 8px secondary (50% opacity), 12px tertiary (30% opacity)
- **Usage**: Applied to key metrics, CTAs, and emphasis text
- **Classes**: `.glow-cyan`, `.glow-green`, `.glow-orange`

## Development Notes

1. **Type Definitions**: Currently empty `src/types/` directory - types should be centralized here per global instructions
2. **Formatting**: Biome handles linting and formatting (replaced Prettier)
3. **Port**: Dev server runs on port 5180 (not default 5173)
4. **Animations**: Extensive custom Tailwind animations defined in config
5. **Component Library**: Uses Naive UI - check their docs for component usage

## Modern CLI Tools (Homebrew Installed)
Use these faster, better alternatives to traditional commands:

### Search & Find (ripgrep + fd + fzf)
```bash
rg "pattern" --glob "*.ts" --glob "*.tsx"   # Search code using ripgrep (faster than grep)
rg "DialogContent" -A 2 -B 2                # Search with context lines
rg -l "useState" src/                       # List files containing pattern
fd "Modal.*tsx" src/                        # Find files by pattern (faster than find)
fd -e tsx -e ts                             # Find TypeScript files
fzf                                         # Interactive fuzzy finder
fzf --preview="bat {}"                      # Fuzzy find with syntax-highlighted preview
```

### File Operations (bat + eza + zoxide)
```bash
bat filename.tsx                            # View files with syntax highlighting (better than cat)
bat -n filename.tsx                         # Show line numbers
eza -la --git                               # List files with Git status (modern ls)
eza -T                                      # Tree view of directory
z tenantflow                                # Smart directory jumping with zoxide
z src                                       # Jump to frequently used directories
```

### Git Operations (delta + modern git tools)
```bash
git diff | delta                            # Enhanced Git diffs with syntax highlighting
git log --oneline | delta                   # Better git log output
git-ignore node                             # Generate .gitignore files
git-lfs track "*.pdf"                       # Track large files with Git LFS
git-secrets --scan                          # Scan for committed secrets
```

### GitHub CLI (gh)
```bash
gh repo view                                # View repository info
gh pr list                                  # List pull requests
gh pr create --title "Fix TypeScript errors" # Create PR
gh issue list                               # List issues
gh auth status                              # Check authentication status
```

### HTTP & API Testing (httpie)
```bash
http GET localhost:5173/api/health          # HTTPie for API testing (better than curl)
http POST localhost:3000/api/users name=John # POST requests with JSON
http --json POST localhost:3000/api/data @data.json # Send JSON file
```

### Command Correction (thefuck)
```bash
fuck                                        # Auto-correct last command
npm run biuld                               # (typo)
fuck                                        # Suggests: npm run build
```

### Text Processing & Analysis
```bash
tree-sitter parse filename.tsx              # Parse code with tree-sitter
fftw-wisdom                                 # FFT optimization (if using audio/signal processing)
```

### Neovim Integration
```bash
nvim filename.tsx                           # Modern Vim with LSP support
nvim +":Telescope find_files"               # Open with file finder
```

### Performance & Debugging
```bash
rg --stats "import.*react"                  # Search with performance stats
fd --exec bat {}                            # Execute command on found files
eza --long --header --git --time-style=long-iso # Detailed file listing
```