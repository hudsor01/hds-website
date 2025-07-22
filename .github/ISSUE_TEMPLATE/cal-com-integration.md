---
name: Cal.com Integration
about: Implement Cal.com scheduling widget for consultation bookings
title: 'Feature: Integrate Cal.com for Consultation Scheduling'
labels: enhancement, integration, frontend
assignees: hudsor01

---

## 📋 Description
Re-implement Cal.com integration for the contact page to allow visitors to schedule consultations directly on the website.

## 🎯 Objectives
- Seamless calendar integration on contact page
- Reduce friction in booking consultations
- Automated scheduling without back-and-forth emails
- Track booking conversions in analytics

## 🔧 Technical Requirements

### Cal.com Setup
- [ ] Create/verify Cal.com account for `hudsondigitalsolutions`
- [ ] Configure event type: `service-consultation` (30 min video call)
- [ ] Set availability and timezone preferences
- [ ] Customize booking page branding to match site theme

### Integration Implementation
- [ ] Install Cal.com embed dependencies
- [ ] Create new `CalendarWidget` component with:
  - Inline calendar embed
  - Popup modal option
  - Mobile-responsive design
  - Loading states
  - Error handling with fallback link
- [ ] Add analytics tracking for:
  - Widget loads
  - Booking initiated
  - Booking completed
  - Conversion funnel

### Code Structure
```typescript
// src/components/CalendarWidget.tsx
interface CalendarWidgetProps {
  calLink: string;
  embedType: 'inline' | 'popup';
  theme?: 'light' | 'dark';
}
```

### Styling Requirements
- Match site's dark theme aesthetic
- Cyan accent color (#00D9FF) for CTAs
- Glass morphism effects
- Smooth animations and transitions

## 📊 Success Metrics
- Increased consultation bookings
- Reduced time to book
- Lower bounce rate on contact page
- Higher conversion rate from visitor to consultation

## 🔗 Resources
- [Cal.com Documentation](https://cal.com/docs)
- [Cal.com Embed Guide](https://cal.com/docs/enterprise-features/embed)
- Previous implementation reference in commit history

## 📝 Notes
- Integration was temporarily removed to fix webpack bundling issues
- Ensure proper TypeScript types are defined
- Test across all browsers and devices
- Consider A/B testing inline vs popup embed types

## ✅ Acceptance Criteria
- [ ] Calendar widget loads without errors
- [ ] Bookings successfully create calendar events
- [ ] Analytics properly track all interactions
- [ ] Mobile experience is smooth
- [ ] Fallback options work if JavaScript fails
- [ ] Page performance metrics remain strong