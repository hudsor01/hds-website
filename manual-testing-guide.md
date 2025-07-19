# Manual Testing Guide for Hudson Digital Solutions

## Testing Instructions for Browser-Based E2E Testing

Since automated browser tools aren't available, use this guide to manually test the website functionality in different browsers and scenarios.

## 1. Core User Journeys Testing

### 1.1 Home Page (/)
**Test Steps:**
1. Open http://localhost:3000 in browser
2. Verify page loads within 3 seconds
3. Check that all sections are visible:
   - Hero section with company branding
   - Navigation bar with all menu items
   - Service highlights
   - Call-to-action buttons
4. Test navigation clicking each menu item
5. Verify theme toggle works (dark/light mode)
6. Test "Get Started" button functionality

**Expected Results:**
- Fast page load (< 3 seconds)
- All content visible and styled correctly
- Navigation works smoothly
- Theme toggle switches successfully
- CTA buttons lead to contact page

### 1.2 Contact Form (/contact)
**Test Steps:**
1. Navigate to contact page
2. Test form validation by submitting empty form
3. Fill out form with valid data:
   - First Name: "Test"
   - Last Name: "User"
   - Email: "test@example.com"
   - Message: "Test message for functionality"
4. Submit form and verify response
5. Test form with invalid email format
6. Test calendar widget functionality

**Expected Results:**
- Form shows validation errors for empty fields
- Valid submission processes successfully
- Invalid email shows error message
- Calendar widget loads and is interactive
- Success message appears after valid submission

### 1.3 Services Page (/services)
**Test Steps:**
1. Navigate to services page
2. Verify all service cards are displayed
3. Test hover effects on service cards
4. Click through service descriptions
5. Test call-to-action buttons

**Expected Results:**
- All services displayed clearly
- Interactive elements respond to user actions
- CTAs lead to appropriate pages
- Content is readable and well-organized

### 1.4 Blog Page (/blog)
**Test Steps:**
1. Navigate to blog page
2. Verify blog posts load
3. Test blog post navigation
4. Check pagination if available
5. Verify Ghost CMS integration

**Expected Results:**
- Blog content loads successfully
- Navigation between posts works
- Pagination functions correctly
- Content displays properly

### 1.5 About Page (/about)
**Test Steps:**
1. Navigate to about page
2. Verify content loads completely
3. Test any interactive elements
4. Check image loading and display

**Expected Results:**
- Page loads quickly
- All content is visible
- Images load and display correctly
- Interactive elements function properly

## 2. Analytics & Performance Testing

### 2.1 Analytics Verification
**Test Steps:**
1. Open browser developer tools (F12)
2. Go to Network tab and refresh page
3. Look for analytics script requests:
   - Google Analytics (gtag)
   - PostHog requests
   - Vercel Analytics
4. Check Console for any analytics errors

**Expected Results:**
- Analytics scripts load successfully
- No console errors related to tracking
- Event tracking fires on user interactions

### 2.2 Performance Testing
**Test Steps:**
1. Open Chrome DevTools → Lighthouse
2. Run Performance audit on each page
3. Check Core Web Vitals:
   - Largest Contentful Paint (LCP) < 2.5s
   - First Input Delay (FID) < 100ms
   - Cumulative Layout Shift (CLS) < 0.1
4. Verify page load times under 3 seconds

**Expected Results:**
- Lighthouse score > 90 for Performance
- Core Web Vitals in "Good" range
- Fast page load times
- No significant layout shifts

### 2.3 SEO Testing
**Test Steps:**
1. View page source (Ctrl+U)
2. Verify meta tags are present:
   - Title tag
   - Meta description
   - Open Graph tags
   - Twitter Card tags
   - Canonical URL
3. Check structured data (JSON-LD)
4. Test robots.txt and sitemap.xml

**Expected Results:**
- All essential meta tags present
- Structured data validates
- Robots.txt and sitemap accessible
- No SEO issues in browser console

## 3. Accessibility Testing

### 3.1 Keyboard Navigation
**Test Steps:**
1. Use only keyboard to navigate entire site
2. Tab through all interactive elements
3. Verify focus indicators are visible
4. Test Enter/Space key functionality
5. Check Escape key for closing modals

**Expected Results:**
- All elements reachable via keyboard
- Clear focus indicators
- Logical tab order
- All buttons/links work with keyboard

### 3.2 Screen Reader Testing
**Test Steps:**
1. Enable screen reader (NVDA, JAWS, or VoiceOver)
2. Navigate through page structure
3. Verify headings hierarchy (H1 → H2 → H3)
4. Test form labels and descriptions
5. Check alt text on images

**Expected Results:**
- Proper heading structure
- All form fields have labels
- Images have descriptive alt text
- Page content reads logically

### 3.3 Color Contrast Testing
**Test Steps:**
1. Use browser accessibility tools
2. Check contrast ratios for text
3. Test with high contrast mode
4. Verify color isn't the only indicator

**Expected Results:**
- Contrast ratios meet WCAG standards
- Text readable in high contrast mode
- Information conveyed without color alone

## 4. Error Handling & Resilience Testing

### 4.1 Error Page Testing
**Test Steps:**
1. Navigate to non-existent page (/nonexistent)
2. Verify 404 page displays correctly
3. Test navigation from error page
4. Check error page maintains site design

**Expected Results:**
- Custom 404 page displays
- Error page is styled consistently
- Navigation back to site works
- Helpful error message provided

### 4.2 Form Error Testing
**Test Steps:**
1. Submit contact form with various invalid inputs:
   - Empty required fields
   - Invalid email format
   - Message too short
2. Verify error messages display
3. Test error message accessibility

**Expected Results:**
- Clear error messages for each field
- Errors announced to screen readers
- Form maintains user input on error
- Error styling is clear and visible

### 4.3 Offline Testing
**Test Steps:**
1. Load website normally
2. Disconnect internet connection
3. Try to navigate to different pages
4. Test form submission offline
5. Reconnect and verify functionality

**Expected Results:**
- Offline page displays when disconnected
- Previously visited pages still accessible
- Graceful handling of offline scenarios
- Normal functionality resumes when online

## 5. Cross-Browser Compatibility Testing

### 5.1 Browser Testing Matrix
Test in these browsers:
- **Chrome** (latest)
- **Firefox** (latest)
- **Safari** (latest)
- **Edge** (latest)

For each browser, verify:
- Page layout and styling
- JavaScript functionality
- Form submission
- Navigation
- Performance

### 5.2 Mobile Testing
**Test Steps:**
1. Resize browser to mobile width (375px)
2. Test mobile navigation menu
3. Verify touch interactions
4. Check form usability on mobile
5. Test with actual mobile devices if available

**Expected Results:**
- Responsive design adapts properly
- Mobile menu functions correctly
- Touch targets are adequate size
- Forms are mobile-friendly
- Content is readable without zooming

### 5.3 Viewport Testing
Test these viewport sizes:
- **Mobile**: 375px × 667px (iPhone SE)
- **Tablet**: 768px × 1024px (iPad)
- **Desktop**: 1920px × 1080px (HD)
- **Large**: 2560px × 1440px (QHD)

## 6. Performance Testing

### 6.1 Load Testing
**Test Steps:**
1. Use browser DevTools Network tab
2. Refresh page and monitor load times
3. Check resource loading waterfall
4. Verify critical resources load first
5. Test with slow network simulation

**Expected Results:**
- First Contentful Paint < 1.8s
- Page fully loaded < 3s
- Critical resources prioritized
- Graceful degradation on slow networks

### 6.2 Resource Optimization
**Test Steps:**
1. Check image optimization and formats
2. Verify CSS and JS minification
3. Test font loading strategy
4. Check for unused resources

**Expected Results:**
- Images appropriately sized and optimized
- CSS/JS files are minified
- Fonts load without blocking render
- No unnecessary resource requests

## 7. Security Testing

### 7.1 Basic Security Checks
**Test Steps:**
1. Check HTTPS enforcement
2. Verify Content Security Policy headers
3. Test form CSRF protection
4. Check for exposed sensitive data

**Expected Results:**
- HTTPS redirects properly
- Security headers present
- Forms protected against CSRF
- No sensitive data in client-side code

## 8. Integration Testing

### 8.1 Third-Party Services
**Test Steps:**
1. Verify Google Analytics tracking
2. Test Cal.com calendar integration
3. Check Ghost CMS blog functionality
4. Verify email service integration

**Expected Results:**
- Analytics events fire correctly
- Calendar booking works
- Blog content loads from Ghost
- Email service processes requests

## Test Execution Checklist

- [ ] All core pages load successfully
- [ ] Contact form validation works
- [ ] Contact form submission processes
- [ ] Navigation functions across all pages
- [ ] Mobile responsive design works
- [ ] Analytics scripts load and track
- [ ] Accessibility features function
- [ ] Error handling works properly
- [ ] Performance meets benchmarks
- [ ] Cross-browser compatibility verified

## Reporting Issues

When reporting issues, include:
1. Browser and version
2. Operating system
3. Viewport size
4. Steps to reproduce
5. Expected vs actual behavior
6. Screenshots if relevant
7. Console errors if any

## Critical Issues Identified

Based on automated testing, pay special attention to:

1. **Contact Form API**: Email service not configured - test with RESEND_API_KEY
2. **Accessibility**: Review semantic HTML structure and ARIA labels
3. **Analytics**: Verify PostHog and Vercel Analytics integration
4. **Performance**: Check structured data implementation

## Recommended Testing Frequency

- **Daily**: Contact form and core functionality
- **Weekly**: Full accessibility and performance audit
- **Before deployment**: Complete test suite execution
- **After changes**: Regression testing of affected areas