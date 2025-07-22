# GitHub Issue: Cal.com Integration

## Issue Title
Feature: Integrate Cal.com for Consultation Scheduling

## Labels
`enhancement`, `integration`, `frontend`, `priority:medium`

## Description

### Summary
Re-implement Cal.com integration for the contact page to allow visitors to schedule consultations directly on the website. This feature was temporarily removed due to webpack bundling issues but should be re-implemented with proper module resolution.

### Background
The Cal.com integration was previously implemented but removed on 2025-07-21 to resolve critical webpack errors. The integration provided:
- Inline calendar embedding
- Popup scheduling option
- Direct booking capabilities
- Analytics tracking

### Implementation Plan

#### Phase 1: Setup & Configuration
- [ ] Verify Cal.com account credentials
- [ ] Configure `hudsondigitalsolutions/service-consultation` event type
- [ ] Set up webhook notifications
- [ ] Test booking flow end-to-end

#### Phase 2: Technical Implementation
```typescript
// Proposed component structure
components/
  CalendarWidget/
    index.tsx          // Main component
    CalendarEmbed.tsx  // Inline embed
    CalendarPopup.tsx  // Popup trigger
    types.ts          // TypeScript definitions
    hooks.ts          // Custom hooks for Cal.com
```

#### Phase 3: Integration Points
1. **Contact Page**: Below contact form, above Google Maps
2. **Services Page**: CTA buttons to book consultations
3. **About Page**: Strategic CTA placement
4. **Navigation**: "Book a Call" button in navbar

### Technical Considerations

#### Dependencies
```json
{
  "@calcom/embed-react": "^1.5.0",
  "@calcom/embed-core": "^1.5.0"
}
```

#### Environment Variables
```env
NEXT_PUBLIC_CAL_LINK=hudsondigitalsolutions/service-consultation
NEXT_PUBLIC_CAL_ORIGIN=https://cal.com
```

#### Analytics Events
- `calendar_widget_loaded`
- `calendar_booking_initiated`
- `calendar_booking_completed`
- `calendar_error`

### UI/UX Requirements
- **Theme**: Dark mode with cyan accents (#22d3ee)
- **Layout**: Responsive grid, mobile-first
- **Loading**: Skeleton screens during embed load
- **Error States**: Graceful fallbacks to direct Cal.com link

### Testing Checklist
- [ ] Desktop: Chrome, Safari, Firefox, Edge
- [ ] Mobile: iOS Safari, Chrome Android
- [ ] Accessibility: Keyboard navigation, screen readers
- [ ] Performance: Core Web Vitals impact < 5%
- [ ] Analytics: All events firing correctly

### Success Metrics
- 25% increase in consultation bookings
- 15% reduction in contact form submissions (direct bookings instead)
- Page load time impact < 200ms
- Zero JavaScript errors in production

### Resources
- [Cal.com Embed Documentation](https://cal.com/docs/enterprise-features/embed)
- [Next.js Dynamic Imports](https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading)
- Previous implementation: Git history before commit [webpack-fix]

### Additional Notes
- Consider implementing as a dynamic import to prevent webpack issues
- Add feature flag for gradual rollout
- Prepare A/B test: inline vs popup embed
- Document troubleshooting steps for future developers

---

**Priority**: Medium  
**Estimated Effort**: 8-12 hours  
**Target Release**: v2.1.0