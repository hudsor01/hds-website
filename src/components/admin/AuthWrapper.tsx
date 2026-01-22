/**
 * Authentication Wrapper for Admin Dashboard
 * Uses Neon Auth for session-based access control
 */

'use client'

import { Lock, Mail } from 'lucide-react'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth/client'
import { logger } from '@/lib/logger'

interface AuthWrapperProps {
  children: ReactNode
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { data, isPending, error } = authClient.useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form on auth error
  useEffect(() => {
    if (error) {
      logger.error('Auth session error', { error: error.message })
    }
  }, [error])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setIsSubmitting(true)

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      })

      if (result.error) {
        setAuthError(result.error.message || 'Sign in failed')
        setPassword('')
      }
    } catch (err) {
      logger.error('Authentication failed', { error: err })
      setAuthError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    try {
      await authClient.signOut()
      setEmail('')
      setPassword('')
    } catch (err) {
      logger.error('Sign out failed', { error: err })
    }
  }

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted dark:bg-background">
        <p className="text-muted-foreground">Checking session…</p>
      </div>
    )
  }

  if (!data?.session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted dark:bg-background">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-heading flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 dark:bg-primary-hover">
                <Lock className="h-8 w-8 text-primary dark:text-accent" />
              </div>
              <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
              <CardDescription>Sign in to access the admin panel</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-content">
                <div className="space-y-tight">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@example.com"
                      className="pl-10"
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <div className="space-y-tight">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                {authError && (
                  <p className="text-sm text-destructive-dark dark:text-destructive-text">{authError}</p>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Signing in…' : 'Sign In'}
                </Button>
              </form>

              <p className="mt-content-block text-center text-xs text-muted-foreground">
                Use your credentials to sign in
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="fixed right-4 top-4 z-modal flex items-center gap-3">
        <span className="text-sm text-muted-foreground">{data.user.email}</span>
        <Button variant="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      {children}
    </div>
  )
}
