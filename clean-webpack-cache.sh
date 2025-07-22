#!/bin/bash

echo "🧹 Cleaning webpack cache and Cal.com references..."

# Remove all build caches
echo "Removing .next cache..."
rm -rf .next

# Remove node_modules to ensure clean install
echo "Removing node_modules..."
rm -rf node_modules

# Remove package-lock to force fresh resolution
echo "Removing package-lock.json..."
rm -f package-lock.json

# Remove Cal.com test files
echo "Removing Cal.com test files..."
rm -f public/test-cal-standalone.html
rm -f scripts/test-cal-diagnostics.ts
rm -f src/app/test-calendar/page.tsx
rm -f src/components/CalendarWidget.tsx
rm -f src/types/cal.d.ts

# Clear npm cache
echo "Clearing npm cache..."
npm cache clean --force

# Remove any temp files
echo "Removing temp files..."
rm -f rm-calcom-files.sh
rm -f clean-webpack-cache.sh

echo "✅ Cleanup complete!"
echo ""
echo "Now run:"
echo "  npm install"
echo "  npm run dev"