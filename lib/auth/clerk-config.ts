/**
 * Clerk Configuration
 * 
 * Configure Clerk authentication for the application
 */

export const clerkConfig = {
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
  secretKey: process.env.CLERK_SECRET_KEY!,
  signInUrl: '/auth/sign-in',
  signUpUrl: '/auth/sign-up',
  afterSignInUrl: '/dashboard',
  afterSignUpUrl: '/dashboard',
}

export const clerkTheme = {
  variables: {
    colorPrimary: '#2563eb', // Blue-600
    colorBackground: '#ffffff',
    colorInputBackground: '#ffffff',
    colorInputText: '#111827',
    colorText: '#111827',
    colorTextSecondary: '#6b7280',
    borderRadius: '0.5rem',
  },
  elements: {
    card: 'shadow-lg border border-gray-200',
    headerTitle: 'text-2xl font-bold text-gray-900',
    headerSubtitle: 'text-gray-600',
    formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors',
    formFieldInput: 'border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    footerActionLink: 'text-blue-600 hover:text-blue-700 font-medium',
  },
}