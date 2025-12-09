/**
 * Form Context Setup for TanStack Form
 * Creates the contexts needed for form composition
 */

import { createFormHookContexts } from '@tanstack/react-form'

// Export contexts and hooks for use in custom components
export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()
