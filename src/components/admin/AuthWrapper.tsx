/**
 * Authentication Wrapper for Admin Dashboard
 * Uses Supabase Auth for secure session-based authentication
 */

'use client';

import { useState, type ReactNode } from 'react';
import { Lock } from 'lucide-react';

interface AuthWrapperProps {
  children: ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    checkAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check for existing session during initialization
    if (typeof window === 'undefined') {
      return false;
    }

    const session = sessionStorage.getItem(SESSION_KEY);
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        const now = Date.now();

        // Session valid for 24 hours
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setPassword('');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setEmail('');
    setPassword('');
  };

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
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <p className="mt-content-block text-center text-xs text-muted-foreground">
                Use your Supabase credentials to sign in
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="fixed right-4 top-4 z-modal flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          {user.email}
        </span>
        <Button variant="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      {children}
    </div>
  );
}
