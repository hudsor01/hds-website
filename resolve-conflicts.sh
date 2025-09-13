#!/bin/bash

# Remove deleted files
echo "Removing deleted files..."
git rm -f e2e/card-components.spec.ts 2>/dev/null || true
git rm -f src/components/BentoGrid.tsx 2>/dev/null || true
git rm -f src/components/HeroSection.tsx 2>/dev/null || true
git rm -f src/components/TestimonialCarousel.tsx 2>/dev/null || true
git rm -f src/components/ui/CTAButton.tsx 2>/dev/null || true
git rm -f src/components/ui/Card.tsx 2>/dev/null || true
git rm -f src/components/ui/SimpleButton.tsx 2>/dev/null || true
git rm -f src/lib/brand.ts 2>/dev/null || true
git rm -f src/lib/ui-constants.ts 2>/dev/null || true

# Accept our version for these files (HEAD version has our updates)
echo "Accepting our version for package files and utilities..."
git checkout --ours package.json
git checkout --ours package-lock.json
git checkout --ours src/utils/performance.ts
git checkout --ours src/utils/accessibility.ts

# Accept our version for API routes
echo "Accepting our version for API routes..."
git checkout --ours src/app/api/contact/route.ts
git checkout --ours src/app/api/lead-magnet/route.ts
git checkout --ours src/app/api/process-emails/route.ts

# Accept our version for blog pages
echo "Accepting our version for blog pages..."
git checkout --ours src/app/blog/how-to-increase-website-conversion-rates-2025-guide/page.tsx
git checkout --ours src/app/blog/small-business-website-cost-2025/page.tsx

# Accept our version for resource pages
echo "Accepting our version for resource pages..."
git checkout --ours src/app/resources/conversion-optimization-toolkit/page.tsx
git checkout --ours src/app/resources/website-performance-checklist/page.tsx

# Accept our version for components
echo "Accepting our version for components..."
git checkout --ours src/components/AnnualWageSummary.tsx
git checkout --ours src/components/ContactForm.tsx
git checkout --ours src/components/PayStub.tsx
git checkout --ours src/components/ui/Button.tsx

# Accept our version for lib files
echo "Accepting our version for lib files..."
git checkout --ours src/lib/analytics.ts
git checkout --ours src/lib/email-sequences.ts
git checkout --ours src/lib/motion.tsx
git checkout --ours src/lib/scheduled-emails.ts
git checkout --ours src/lib/states.ts
git checkout --ours src/lib/storage.ts
git checkout --ours src/lib/tax-calculations.ts
git checkout --ours src/lib/utils.ts
git checkout --ours src/lib/validation.ts

# Accept our version for other files
echo "Accepting our version for remaining files..."
git checkout --ours src/app/contact/page.tsx
git checkout --ours src/app/globals.css
git checkout --ours src/types/paystub.ts

# Add all resolved files
echo "Adding all resolved files..."
git add -A

echo "Conflicts resolved! Ready to commit."