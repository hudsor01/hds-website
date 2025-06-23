# Hudson Digital Website - Design System

## Design Theme: "Elevated Cards"

The site follows an **elevated card design system** inspired by the floating browser mockup on the homepage. This creates a premium, modern aesthetic with depth and sophistication.

### Core Design Principles:

1. **Floating Elements**: Key content is contained in elevated cards with subtle shadows
2. **Layered Depth**: Multiple levels of elevation create visual hierarchy
3. **Clean Backgrounds**: Light gray/white backgrounds allow cards to "pop"
4. **Rounded Corners**: Consistent border-radius for modern feel
5. **Subtle Shadows**: Professional drop shadows for depth without being heavy

### Card System Classes:

- **Primary Cards**: `bg-white rounded-2xl shadow-lg border border-gray-100`
- **Interactive Cards**: Add `hover:shadow-xl hover:-translate-y-1 transition-all duration-300`
- **Logo Containers**: `bg-white rounded-2xl shadow-lg border border-gray-100 p-4`
- **Content Sections**: Elevated from background with proper spacing

### Color Palette:

- **Primary Blue**: `#0ea5e9` (primary-500)
- **Background**: `#f8fafc` (gray-50)
- **Cards**: `#ffffff` (white)
- **Text**: `#0f172a` (gray-900)
- **Borders**: `#e2e8f0` (gray-200)

### Implementation Notes:

- Logo always appears in elevated containers, never floating alone
- Service cards, portfolio items, and forms follow the elevated card pattern
- Hover states add elevation and subtle movement
- Consistent spacing and typography throughout
- Mobile-first responsive design

### Typography:

- **Primary Font**: Inter (clean, modern)
- **Headings**: Bold weights for hierarchy
- **Body**: Regular weight for readability

This design system creates a cohesive, professional appearance that makes content feel premium and trustworthy.