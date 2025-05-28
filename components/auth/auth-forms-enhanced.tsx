'use client'

/**
 * Enhanced Authentication Forms for Next.js 15
 * 
 * Form components following Next.js patterns with:
 * - useActionState for form state management
 * - Server Action integration
 * - Real-time validation feedback
 * - Loading states and accessibility
 * - Error handling and user feedback
 */

import { useActionState } from 'react'
import { Eye, EyeOff, User, Lock, Mail, Shield, LogIn, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { login, signup, changePassword, createUser } from '@/app/actions/auth-enhanced'

// Login Form Component
export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold text-center flex items-center justify-center gap-2'>
          <Shield className='w-6 h-6' />
          Admin Login
        </CardTitle>
        <CardDescription className='text-center'>
          Enter your credentials to access the admin dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className='space-y-4'>
          {/* Username Field */}
          <div className='space-y-2'>
            <Label htmlFor='username'>Username</Label>
            <div className='relative'>
              <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
              <Input
                id='username'
                name='username'
                type='text'
                placeholder='Enter your username'
                className='pl-10'
                required
                aria-describedby={state?.errors?.username ? 'username-error' : undefined}
              />
            </div>
            {state?.errors?.username && (
              <p id='username-error' className='text-sm text-destructive' role='alert'>
                {state.errors.username[0]}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className='space-y-2'>
            <Label htmlFor='password'>Password</Label>
            <div className='relative'>
              <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
              <Input
                id='password'
                name='password'
                type={showPassword ? 'text' : 'password'}
                placeholder='Enter your password'
                className='pl-10 pr-10'
                required
                aria-describedby={state?.errors?.password ? 'password-error' : undefined}
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground'
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
              </button>
            </div>
            {state?.errors?.password && (
              <p id='password-error' className='text-sm text-destructive' role='alert'>
                {state.errors.password[0]}
              </p>
            )}
          </div>

          {/* Form-level errors */}
          {state?.errors?._form && (
            <Alert variant='destructive'>
              <AlertDescription>
                {state.errors._form[0]}
              </AlertDescription>
            </Alert>
          )}

          {/* Success message */}
          {state?.message && (
            <Alert>
              <AlertDescription>
                {state.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type='submit'
            className='w-full'
            disabled={pending}
          >
            {pending ? (
              <>
                <div className='w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2' />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className='w-4 h-4 mr-2' />
                Sign In
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// Signup Form Component (for future use)
export function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold text-center flex items-center justify-center gap-2'>
          <UserPlus className='w-6 h-6' />
          Create Account
        </CardTitle>
        <CardDescription className='text-center'>
          Fill in the information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className='space-y-4'>
          {/* Username Field */}
          <div className='space-y-2'>
            <Label htmlFor='username'>Username</Label>
            <div className='relative'>
              <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
              <Input
                id='username'
                name='username'
                type='text'
                placeholder='Choose a username'
                className='pl-10'
                required
                aria-describedby={state?.errors?.username ? 'username-error' : undefined}
              />
            </div>
            {state?.errors?.username && (
              <p id='username-error' className='text-sm text-destructive' role='alert'>
                {state.errors.username[0]}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <div className='relative'>
              <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
              <Input
                id='email'
                name='email'
                type='email'
                placeholder='Enter your email'
                className='pl-10'
                required
                aria-describedby={state?.errors?.email ? 'email-error' : undefined}
              />
            </div>
            {state?.errors?.email && (
              <p id='email-error' className='text-sm text-destructive' role='alert'>
                {state.errors.email[0]}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className='space-y-2'>
            <Label htmlFor='password'>Password</Label>
            <div className='relative'>
              <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
              <Input
                id='password'
                name='password'
                type={showPassword ? 'text' : 'password'}
                placeholder='Create a password'
                className='pl-10 pr-10'
                required
                aria-describedby={state?.errors?.password ? 'password-error' : undefined}
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground'
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
              </button>
            </div>
            {state?.errors?.password && (
              <div id='password-error' className='text-sm text-destructive' role='alert'>
                <p>Password must:</p>
                <ul className='list-disc list-inside mt-1'>
                  {state.errors.password.map((error: string, index: number) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className='space-y-2'>
            <Label htmlFor='confirmPassword'>Confirm Password</Label>
            <div className='relative'>
              <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
              <Input
                id='confirmPassword'
                name='confirmPassword'
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder='Confirm your password'
                className='pl-10 pr-10'
                required
                aria-describedby={state?.errors?.confirmPassword ? 'confirm-password-error' : undefined}
              />
              <button
                type='button'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground'
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
              </button>
            </div>
            {state?.errors?.confirmPassword && (
              <p id='confirm-password-error' className='text-sm text-destructive' role='alert'>
                {state.errors.confirmPassword[0]}
              </p>
            )}
          </div>

          {/* Form-level errors */}
          {state?.errors?._form && (
            <Alert variant='destructive'>
              <AlertDescription>
                {state.errors._form[0]}
              </AlertDescription>
            </Alert>
          )}

          {/* Success message */}
          {state?.message && (
            <Alert>
              <AlertDescription>
                {state.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type='submit'
            className='w-full'
            disabled={pending}
          >
            {pending ? (
              <>
                <div className='w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2' />
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className='w-4 h-4 mr-2' />
                Create Account
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// Change Password Form Component
export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, undefined)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-xl font-bold'>Change Password</CardTitle>
        <CardDescription>
          Update your password to keep your account secure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className='space-y-4'>
          {/* Current Password Field */}
          <div className='space-y-2'>
            <Label htmlFor='currentPassword'>Current Password</Label>
            <div className='relative'>
              <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
              <Input
                id='currentPassword'
                name='currentPassword'
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder='Enter your current password'
                className='pl-10 pr-10'
                required
                aria-describedby={state?.errors?.password ? 'current-password-error' : undefined}
              />
              <button
                type='button'
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground'
                aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
              >
                {showCurrentPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
              </button>
            </div>
            {state?.errors?.password && (
              <p id='current-password-error' className='text-sm text-destructive' role='alert'>
                {state.errors.password[0]}
              </p>
            )}
          </div>

          {/* New Password Field */}
          <div className='space-y-2'>
            <Label htmlFor='newPassword'>New Password</Label>
            <div className='relative'>
              <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
              <Input
                id='newPassword'
                name='newPassword'
                type={showNewPassword ? 'text' : 'password'}
                placeholder='Enter your new password'
                className='pl-10 pr-10'
                required
                aria-describedby={state?.errors?.password ? 'new-password-error' : undefined}
              />
              <button
                type='button'
                onClick={() => setShowNewPassword(!showNewPassword)}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground'
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
              </button>
            </div>
            {state?.errors?.password && (
              <div id='new-password-error' className='text-sm text-destructive' role='alert'>
                <p>New password must:</p>
                <ul className='list-disc list-inside mt-1'>
                  {state.errors.password.map((error: string, index: number) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className='space-y-2'>
            <Label htmlFor='confirmPassword'>Confirm New Password</Label>
            <div className='relative'>
              <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
              <Input
                id='confirmPassword'
                name='confirmPassword'
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder='Confirm your new password'
                className='pl-10 pr-10'
                required
                aria-describedby={state?.errors?.confirmPassword ? 'confirm-new-password-error' : undefined}
              />
              <button
                type='button'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground'
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
              </button>
            </div>
            {state?.errors?.confirmPassword && (
              <p id='confirm-new-password-error' className='text-sm text-destructive' role='alert'>
                {state.errors.confirmPassword[0]}
              </p>
            )}
          </div>

          {/* Form-level errors */}
          {state?.errors?._form && (
            <Alert variant='destructive'>
              <AlertDescription>
                {state.errors._form[0]}
              </AlertDescription>
            </Alert>
          )}

          {/* Success message */}
          {state?.message && (
            <Alert>
              <AlertDescription>
                {state.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type='submit'
            className='w-full'
            disabled={pending}
          >
            {pending ? (
              <>
                <div className='w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2' />
                Updating password...
              </>
            ) : (
              <>
                <Lock className='w-4 h-4 mr-2' />
                Update Password
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// Create User Form Component (Admin only)
export function CreateUserForm() {
  const [state, action, pending] = useActionState(createUser, undefined)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-xl font-bold'>Create New User</CardTitle>
        <CardDescription>
          Add a new user to the system (Admin only)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className='space-y-4'>
          {/* Username Field */}
          <div className='space-y-2'>
            <Label htmlFor='username'>Username</Label>
            <div className='relative'>
              <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
              <Input
                id='username'
                name='username'
                type='text'
                placeholder='Enter username'
                className='pl-10'
                required
                aria-describedby={state?.errors?.username ? 'username-error' : undefined}
              />
            </div>
            {state?.errors?.username && (
              <p id='username-error' className='text-sm text-destructive' role='alert'>
                {state.errors.username[0]}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <div className='relative'>
              <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
              <Input
                id='email'
                name='email'
                type='email'
                placeholder='Enter email address'
                className='pl-10'
                required
                aria-describedby={state?.errors?.email ? 'email-error' : undefined}
              />
            </div>
            {state?.errors?.email && (
              <p id='email-error' className='text-sm text-destructive' role='alert'>
                {state.errors.email[0]}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className='space-y-2'>
            <Label htmlFor='password'>Password</Label>
            <div className='relative'>
              <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
              <Input
                id='password'
                name='password'
                type={showPassword ? 'text' : 'password'}
                placeholder='Enter password'
                className='pl-10 pr-10'
                required
                aria-describedby={state?.errors?.password ? 'password-error' : undefined}
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground'
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
              </button>
            </div>
            {state?.errors?.password && (
              <p id='password-error' className='text-sm text-destructive' role='alert'>
                {state.errors.password[0]}
              </p>
            )}
          </div>

          {/* Role Field */}
          <div className='space-y-2'>
            <Label htmlFor='role'>Role</Label>
            <Select name='role' required>
              <SelectTrigger>
                <SelectValue placeholder='Select user role' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='user'>User</SelectItem>
                <SelectItem value='admin'>Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Form-level errors */}
          {state?.errors?._form && (
            <Alert variant='destructive'>
              <AlertDescription>
                {state.errors._form[0]}
              </AlertDescription>
            </Alert>
          )}

          {/* Success message */}
          {state?.message && (
            <Alert>
              <AlertDescription>
                {state.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type='submit'
            className='w-full'
            disabled={pending}
          >
            {pending ? (
              <>
                <div className='w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2' />
                Creating user...
              </>
            ) : (
              <>
                <UserPlus className='w-4 h-4 mr-2' />
                Create User
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}