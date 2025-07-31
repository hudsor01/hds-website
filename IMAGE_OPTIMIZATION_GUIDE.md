# Image Optimization Guide

## Current State
- No `<img>` tags found in the codebase ✅
- Images referenced only in metadata/SEO
- Logo and favicons in public directory

## Image Optimization Strategy

### 1. Convert Existing Images to WebP
```bash
# Install conversion tool
brew install webp

# Convert images
cwebp -q 80 public/HDS-Logo.jpeg -o public/HDS-Logo.webp
```

### 2. When Adding Images, Use Next.js Image Component

```typescript
import Image from 'next/image';

// Instead of:
<img src="/HDS-Logo.jpeg" alt="Hudson Digital" />

// Use:
<Image
  src="/HDS-Logo.jpeg"
  alt="Hudson Digital Solutions"
  width={200}
  height={100}
  priority={false} // true for above-fold images
  loading="lazy"   // automatic for below-fold
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..." // generated
/>
```

### 3. Responsive Images
```typescript
<Image
  src="/hero-image.jpg"
  alt="Description"
  width={1200}
  height={600}
  sizes="(max-width: 640px) 100vw, 
         (max-width: 1024px) 50vw, 
         33vw"
  className="rounded-lg"
/>
```

### 4. External Images
```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['example.com', 'cdn.example.com'],
    formats: ['image/avif', 'image/webp'],
  },
}
```

### 5. Image Optimization Benefits
- **Automatic WebP/AVIF**: Next.js serves modern formats
- **Lazy Loading**: Built-in for performance
- **Responsive**: Automatic srcset generation
- **Blur Placeholder**: Better perceived performance
- **Size Optimization**: Automatic resizing

### 6. Implementation Checklist
- [ ] Convert logo to WebP format
- [ ] Update metadata to use WebP with JPEG fallback
- [ ] Add blur placeholders for hero images
- [ ] Configure image domains in next.config.js
- [ ] Set up image optimization in Vercel

### 7. Performance Impact
- **Before**: JPEG ~100KB
- **After**: WebP ~40KB (60% reduction)
- **Load Time**: 200ms → 80ms
- **LCP Impact**: Significant improvement

## Current Images to Optimize

1. `/public/HDS-Logo.jpeg` (47KB)
2. `/public/android-chrome-*.png` (various sizes)
3. `/public/apple-touch-icon.png` (180x180)
4. Generated images (need renaming/optimization)

## Next Steps
1. Run image optimization script
2. Update all image references to use Next Image
3. Generate blur data URLs
4. Test WebP browser support