#!/bin/bash

echo "🔧 Quick Production Build Fixes"
echo "=============================="

# Fix ESLint semicolon errors
echo "1. Fixing ESLint semicolon errors..."
sed -i '' 's/;$//' lib/data-fetchers.ts 2>/dev/null || sed -i 's/;$//' lib/data-fetchers.ts

# Fix trailing comma
echo "2. Fixing trailing comma..."
sed -i '' '252s/$/,/' lib/integrations/cal-supabase-wrapper.ts 2>/dev/null || sed -i '252s/$/,/' lib/integrations/cal-supabase-wrapper.ts

# Fix the typo in leads page
echo "3. Fixing typo in leads page..."
sed -i '' 's/updateStatusmutation/updateStatusMutation/g' app/\(admin\)/leads/page.tsx 2>/dev/null || sed -i 's/updateStatusmutation/updateStatusMutation/g' app/\(admin\)/leads/page.tsx

# Run ESLint fix
echo "4. Running ESLint auto-fix..."
npm run lint:fix

echo ""
echo "✅ Quick fixes applied!"
echo ""
echo "Next steps:"
echo "1. Run: npm run type-check | grep -c 'error TS' to see remaining TypeScript errors"
echo "2. Run: npm run lint to see remaining ESLint issues"
echo "3. Try: npm run build to test production build"
