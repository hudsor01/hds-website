/**
 * Authentication Wrapper for Admin Dashboard
 * Uses Supabase Auth for session-based access control
 */

'use client'

import type { User } from '@supabase/supabase-js'
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
import { createClient } from '@/lib/supabase/client'
import { logger } from '@/lib/logger'

interface AuthWrapperProps {
  children: ReactNode
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    // During SSG/build, supabase client may be null
    if (!supabase) {
      setLoading(false)
      return
    }

    let isMounted = true

    const init = async () => {
      const { data } = await supabase.auth.getUser()
      if (!isMounted) {return}
      setUser(data.user)
      setLoading(false)
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {return}
      setUser(session?.user ?? null)
      setLoading(false)
    })

    init()

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!supabase) {
      setError('Authentication not available')
      return
    }
    setError('')
    setIsSubmitting(true)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        setPassword('')
      }
    } catch (error) {
      logger.error('Authentication failed', { error });
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = async () => {
    if (!supabase) {return}
    await supabase.auth.signOut()
    setEmail('')
    setPassword('')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted dark:bg-background">
        <p className="text-muted-foreground">Checking session…</p>
      </div>
    )
  }

  if (!user) {
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

                {error && (
                  <p className="text-sm text-destructive-dark dark:text-destructive-text">{error}</p>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Signing in…' : 'Sign In'}
                </Button>
              </form>

              <p className="mt-content-block text-center text-xs text-muted-foreground">
                Use your Supabase credentials to sign in
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
        <span className="text-sm text-muted-foreground">{user.email}</span>
        <Button variant="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      {children}
    </div>
  )
}
