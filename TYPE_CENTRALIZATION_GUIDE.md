# Type Centralization Guide

## Overview

This guide documents the centralized type system implemented to eliminate inline type definitions and create a single source of truth for all TypeScript types in the project.

## Centralized Type Files

### 📁 `/src/types/` Directory Structure

```
src/types/
├── api.ts          # API, rate limiting, and request/response types
├── analytics.ts    # Email sequences, analytics, and tracking types
├── components.ts   # Component prop interfaces and UI types
├── database.ts     # Database schema types (auto-generated)
├── forms.ts        # Form data, validation, and field types
├── hooks.ts        # Custom React hook types and state interfaces
├── paystub.ts      # Paystub generator and tax calculation types
├── performance.ts  # Performance monitoring and Web Vitals types
├── seo.ts         # SEO metadata and schema markup types
├── test.ts        # Testing utilities and mock types
└── utils.ts       # Utility functions, feature flags, and library types
```

## Import Patterns

### ✅ Correct Import Patterns

```typescript
// Component files
import type { ContactFormProps, FloatingInputProps } from '@/types/components';

// API routes
import type { ContactFormData, ApiResponse } from '@/types/forms';
import type { RateLimitConfig } from '@/types/api';

// Utility files
import type { ImageLoaderProps, FeatureFlagKey } from '@/types/utils';

// Analytics and tracking
import type { EmailSequence, UserProperties } from '@/types/analytics';

// Hooks
import type { LoadingState, UseApiClientOptions } from '@/types/hooks';
```

### ❌ Avoid These Patterns

```typescript
// ❌ Don't define inline interfaces
interface ComponentProps {
  title: string;
}

// ❌ Don't create local type files
import type { LocalType } from './local-types';

// ❌ Don't use relative imports for types
import type { SomeType } from '../../../types/components';
```

## Type Organization Rules

### 1. **Component Types** → `types/components.ts`
- Component prop interfaces
- UI element types
- Layout and design system types
- Event handler types

### 2. **Form Types** → `types/forms.ts`
- Form data structures
- Validation interfaces
- Field configuration types
- Form state management

### 3. **API Types** → `types/api.ts`
- Request/response structures
- Error handling types
- Rate limiting configurations
- Authentication types

### 4. **Utility Types** → `types/utils.ts`
- Library configurations
- Feature flag definitions
- Image processing types
- Touch interaction types

### 5. **Analytics Types** → `types/analytics.ts`
- Email sequence configurations
- Tracking event definitions
- User behavior types
- Marketing automation

## Maintenance Guidelines

### Adding New Types

1. **Determine the correct file** based on the type's purpose
2. **Add the type definition** with proper JSDoc comments
3. **Export the type** using named exports
4. **Update imports** in files that need the type

```typescript
// In types/components.ts
/**
 * Props for the new feature component
 */
export interface NewFeatureProps {
  title: string;
  description?: string;
  onAction: () => void;
}

// In the component file
import type { NewFeatureProps } from '@/types/components';
```

### Refactoring Existing Types

1. **Search for inline definitions** using patterns like `interface \w+` or `type \w+`
2. **Move to appropriate centralized file**
3. **Update all import statements**
4. **Run typecheck** to verify no errors
5. **Run linting** to ensure code quality

### Type Naming Conventions

- **Props interfaces**: `ComponentNameProps`
- **Data types**: `EntityNameData`
- **Configuration types**: `ServiceNameConfig`
- **Response types**: `ApiNameResponse`
- **State types**: `FeatureNameState`

## Verification Commands

```bash
# Check for remaining inline types
rg "^(export )?(interface|type|enum) \w+" src --type ts

# Verify TypeScript compilation
npm run typecheck

# Check linting compliance
npm run lint

# Search for specific type usage
rg "ContactFormData" src --type ts
```

## Benefits Achieved

### 🎯 **Consistency**
- All types follow the same naming conventions
- Centralized location eliminates duplicate definitions
- Standardized import patterns across the codebase

### 🔧 **Maintainability**
- Single source of truth for type definitions
- Easier to update types across multiple files
- Clear separation of concerns by type category

### 📈 **Developer Experience**
- Better IDE autocomplete and IntelliSense
- Easier type discovery and exploration
- Reduced cognitive load when working with types

### 🛡️ **Type Safety**
- Eliminates type inconsistencies
- Prevents accidental type drift
- Improved compile-time error detection

## Migration Checklist

- [x] Move all inline interface definitions to centralized files
- [x] Update import statements across the codebase
- [x] Resolve type conflicts and naming collisions
- [x] Fix component prop type mismatches
- [x] Verify TypeScript compilation passes
- [x] Ensure linting compliance
- [x] Document the new type system

## Future Considerations

### Automatic Type Generation
Consider implementing automatic type generation for:
- API response types from OpenAPI schemas
- Database types from schema files
- Form types from validation schemas

### Type Testing
Implement type-level testing to ensure:
- Type compatibility across components
- Breaking change detection
- Type coverage metrics

### Documentation Integration
Consider tools like:
- TypeDoc for automatic API documentation
- Type visualization tools
- Interactive type explorers