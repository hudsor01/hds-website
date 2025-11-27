/**
 * Simple Authentication Wrapper for Admin Dashboard
 * Password-based protection (upgrade to Supabase Auth later)
 */

'use client';

import { useState, type ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthWrapperProps {
  children: ReactNode;
}

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
const SESSION_KEY = 'admin_session';

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    const session = sessionStorage.getItem(SESSION_KEY);
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        const now = Date.now();

        if (sessionData.expires > now) {
          return true;
        } else {
          sessionStorage.removeItem(SESSION_KEY);
        }
      } catch {
        sessionStorage.removeItem(SESSION_KEY);
      }
    }

    return false;
  });
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === ADMIN_PASSWORD) {
      const session = {
        authenticated: true,
        expires: Date.now() + (24 * 60 * 60 * 1000),
      };

      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password');
      setPassword('');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted dark:bg-background">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-900">
                <Lock className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
              </div>
              <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
              <CardDescription>Enter password to access analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    autoFocus
                  />
                  {error && (
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  )}
                </div>

                <Button type="submit" className="w-full">
                  Sign In
                </Button>
              </form>

              <p className="mt-6 text-center text-xs text-muted-foreground">
                Session valid for 24 hours
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="fixed right-4 top-4 z-50">
        <Button variant="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      {children}
    </div>
  );
}
