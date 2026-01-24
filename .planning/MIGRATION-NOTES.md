# Migration Notes

## Pending Migrations to Architectural Standards

### Server Actions → TanStack Query Mutations

**File:** `src/app/actions/ttl-calculator.ts`
**Used by:** `src/components/calculators/Calculator.tsx`
**Status:** ⏳ Pending Migration

**Current Implementation:**
- Server Actions: `emailResults()`, `saveCalculation()`
- Imported in Calculator component
- Uses `useTransition` for loading states

**Target Implementation:**
- Convert to TanStack Query mutations
- Move to `src/hooks/use-ttl-calculator-actions.ts`
- Use `useMutation` from `@tanstack/react-query`

**Benefits of Migration:**
- ✅ Client-side operation (free on user's browser)
- ✅ Automatic loading/error states via React Query
- ✅ Consistent pattern with other forms (ContactForm, Newsletter)
- ✅ Reduced Vercel server costs (no server compute for mutations)

**Migration Steps:**
1. Create `src/hooks/use-ttl-calculator-actions.ts`
2. Implement mutations:
   ```typescript
   export function useTTLCalculatorActions() {
     const emailMutation = useMutation({
       mutationFn: async (data) => {
         // API call to send email
       }
     });

     const saveMutation = useMutation({
       mutationFn: async (data) => {
         // API call to save calculation
       }
     });

     return { emailMutation, saveMutation };
   }
   ```
3. Update Calculator.tsx to use mutations instead of Server Actions
4. Remove `src/app/actions/ttl-calculator.ts`
5. Test email and save functionality

**Priority:** Medium - current implementation works but doesn't follow standardized pattern

---

## Completed Migrations

### ✅ Forms Standardization
- ContactForm: Uses TanStack Form + React Query ✅
- NewsletterSignup: Uses TanStack Form + React Query ✅
- Pattern: Client-side validation, instant feedback, cost-optimized

### ✅ Server Actions Cleanup
- Removed `src/app/actions/contact.ts` (unused, zero imports)
- Forms use TanStack Query mutations instead

---

*Last updated: 2026-01-09 during Phase 1 execution*
