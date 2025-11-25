# Semantic Token System Documentation

This project uses a comprehensive semantic token system to ensure consistent styling across all components and pages. This documentation explains the system's structure, usage, and benefits.

## Overview

Semantic tokens are named variables that represent design decisions. Instead of using raw values like `#007acc`, we use meaningful names like `--color-brand-primary` which provide context about the token's purpose.

## Token Categories

### Color Tokens

#### Brand Colors
- `--color-brand-primary`: Primary brand color (cyan-600 equivalent)
- `--color-brand-secondary`: Secondary brand color (cyan-400 equivalent) 
- `--color-brand-accent`: Accent brand color (emerald-500 equivalent)
- `--color-brand-tertiary`: Tertiary brand color (blue-500 equivalent)
- `--color-brand-purple`: Purple brand color (purple-500 equivalent)

#### Semantic Background Colors
- `--color-bg-primary`: Primary background color
- `--color-bg-secondary`: Secondary background color
- `--color-bg-tertiary`: Tertiary background color
- `--color-bg-card`: Card background color
- `--color-bg-overlay`: Overlay background with transparency

#### Semantic Text Colors
- `--color-text-primary`: Primary text color
- `--color-text-secondary`: Secondary text color
- `--color-text-muted`: Muted text color
- `--color-text-inverted`: Inverted text color (typically white)

#### Semantic Action Colors
- `--color-success`: Success state color
- `--color-warning`: Warning state color
- `--color-danger`: Danger/error state color
- `--color-info`: Information state color

#### Semantic Border Colors
- `--color-border-primary`: Primary border color
- `--color-border-secondary`: Secondary border color
- `--color-border-accent`: Accent border color

#### Semantic Gradient Colors
- `--color-gradient-primary-start`: Primary gradient start
- `--color-gradient-primary-end`: Primary gradient end
- `--color-gradient-secondary-start`: Secondary gradient start
- `--color-gradient-secondary-end`: Secondary gradient end
- `--color-gradient-accent-start`: Accent gradient start
- `--color-gradient-accent-end`: Accent gradient end

#### Dark Mode Colors
- `--color-bg-primary-dark`: Dark mode primary background
- `--color-bg-secondary-dark`: Dark mode secondary background
- `--color-bg-tertiary-dark`: Dark mode tertiary background
- `--color-bg-card-dark`: Dark mode card background
- `--color-text-primary-dark`: Dark mode primary text
- `--color-text-secondary-dark`: Dark mode secondary text
- `--color-border-primary-dark`: Dark mode primary border
- `--color-border-secondary-dark`: Dark mode secondary border

### Spacing Tokens
- `--spacing-1` to `--spacing-64`: Consistent spacing values from 0.25rem to 16rem
- `--spacing-18`: 4.5rem specific value
- `--spacing-22`: 5.5rem specific value

### Radius Tokens
- `--radius-sm`: Small border radius (0.25rem)
- `--radius-md`: Medium border radius (0.5rem)
- `--radius-lg`: Large border radius (0.75rem)
- `--radius-xl`: Extra large border radius (1rem)
- `--radius-2xl`: 2x large border radius (1.5rem)
- `--radius-3xl`: 3x large border radius (2rem)
- `--radius-full`: Full border radius (9999px)

### Shadow Tokens
- `--shadow-sm`: Small shadow
- `--shadow`: Default shadow
- `--shadow-md`: Medium shadow
- `--shadow-lg`: Large shadow
- `--shadow-xl`: Extra large shadow
- `--shadow-2xl`: 2x large shadow

### Breakpoint Tokens
- `--breakpoint-xs`: 30rem (480px)
- `--breakpoint-sm`: 36rem (576px)
- `--breakpoint-md`: 48rem (768px)
- `--breakpoint-lg`: 64rem (1024px)
- `--breakpoint-xl`: 80rem (1280px)
- `--breakpoint-2xl`: 96rem (1536px)
- `--breakpoint-3xl`: 112rem (1792px)
- `--breakpoint-4xl`: 128rem (2048px)

### Animation Timing Tokens
- `--duration-instant`: 50ms for instant animations
- `--duration-fast`: 150ms for fast animations
- `--duration-normal`: 300ms for normal animations
- `--duration-slow`: 500ms for slow animations
- `--duration-slower`: 1000ms for slower animations
- `--ease-out`, `--ease-in`, `--ease-in-out`: Easing functions

### Blur Tokens
- `--blur-xs` to `--blur-3xl`: Different blur levels

### Typography Tokens
- `--text-xs` to `--text-5xl`: Text size tokens
- `--text-xs--line-height` to `--text-5xl--line-height`: Line height tokens
- `--font-weight-thin` to `--font-weight-black`: Font weight tokens

## CSS Classes

### Button Classes
- `.button-primary`: Primary action button using gradient from primary brand colors
- `.button-secondary`: Secondary action button using transparent with border
- `.button-tertiary`: Tertiary action button with subtle background

### Container Classes
- `.container-narrow`: Max width 2xl (768px) with horizontal auto margin
- `.container-wide`: Max width 7xl (1280px) with horizontal auto margin
- `.container-full`: Full width container

### Layout Classes
- `.flex-center`: Center content both horizontally and vertically
- `.flex-between`: Space content with main items at start and end
- `.flex-end`: Right-align content
- `.flex-start`: Left-align content

### Hover/Glow Classes
- `.card-hover-glow`: Add glow on hover for cards
- `.card-hover-glow-secondary`: Secondary color glow for cards
- `.card-hover-glow-accent`: Accent color glow for cards
- `.card-hover-glow-tertiary`: Tertiary color glow for cards
- `.button-hover-glow`: Add glow effect on button hover
- `.hover-lift`: Lift effect on hover with scale and translate
- `.hover-glow`: Add glow shadow on hover

### Transition Classes
- `.transition-smooth`: Smooth transition for all properties
- `.transition-fast`: Fast transition using duration-fast
- `.transition-normal`: Normal transition using duration-normal
- `.transition-slow`: Slow transition using duration-slow

### Gradient Classes
- `.bg-gradient-hero`: Hero section gradient
- `.bg-gradient-primary`: Primary brand gradient
- `.bg-gradient-secondary`: Secondary brand gradient
- `.bg-gradient-accent`: Accent gradient
- Variants with opacity levels (10%, 20%, 30%)

### Typography Classes
- `.typography`: Base typography styling
- `.text-responsive-xs` to `.text-responsive-xl`: Responsive text sizes
- Semantic heading classes (h1-h6) with responsive sizing

## Benefits

1. **Consistency**: Ensures the same visual treatment across all components
2. **Maintainability**: Changes to design tokens automatically propagate throughout the application
3. **Accessibility**: All colors are carefully chosen for proper contrast ratios
4. **Theming**: Easy to create themes by changing token values
5. **Dark Mode**: Properly defined dark mode tokens for seamless theme switching

## Usage Examples

### Using CSS Custom Properties
```css
.my-component {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
}
```

### Using CSS Classes
```jsx
<div className="glass-card p-6 border border-border-primary">
  <h2 className="text-2xl font-bold text-text-primary">Title</h2>
  <p className="text-text-secondary">Content</p>
  <button className="button-primary">Action</button>
</div>
```

## Creating New Tokens

When adding new design tokens:

1. Add them to the `@theme` section in `globals.css`
2. Use the semantic naming convention: `--{category}-{context?}-{variant?}-{property}`
3. Ensure proper dark mode values are also included if needed
4. Add CSS classes that consume the tokens in the `@layer components` section

## Migration Guidelines

To migrate from non-semantic classes to semantic tokens:

1. Identify non-semantic color or spacing values in your CSS
2. Replace with appropriate semantic tokens
3. Update component classes to use semantic class names
4. Test in both light and dark modes

## Testing

The semantic token system is tested by ensuring:

1. Consistent visual appearance across components
2. Proper contrast ratios for accessibility
3. Correct behavior in dark mode
4. Responsive behavior across breakpoints
