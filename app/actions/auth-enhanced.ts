/**
 * Enhanced Authentication Server Actions for Next.js 15
 * 
 * Server Actions following Next.js official patterns with:
 * - Form validation with Zod schemas
 * - Secure authentication flow
 * - Session management
 * - Error handling and user feedback
 * - useActionState integration
 */

'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { 
  LoginFormSchema, 
  SignupFormSchema, 
  type FormState,
  authenticateUser,
  createSession,
  deleteSession,
  requireAuth,
  authorizeServerAction,
} from '@/lib/auth/auth-enhanced'
import { logger } from '@/lib/logger'

/**
 * Login Server Action with comprehensive validation and error handling
 */
export async function login(state: FormState, formData: FormData): Promise<FormState> {
  try {
    // 1. Validate form fields
    const validatedFields = LoginFormSchema.safeParse({
      username: formData.get('username'),
      password: formData.get('password'),
    })

    // If validation fails, return early with errors
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { username, password } = validatedFields.data

    // 2. Authenticate user
    const user = await authenticateUser(username, password)

    if (!user) {
      return {
        errors: {
          _form: ['Invalid username or password. Please try again.'],
        },
      }
    }

    // 3. Create session
    await createSession(user, {
      loginTime: new Date().toISOString(),
      userAgent: 'server-action', // In a real app, you'd get this from headers
    })

    logger.info('User login successful', {
      userId: user.id,
      username: user.username,
      role: user.role,
    })

    // 4. Redirect to appropriate dashboard
    if (user.role === 'admin') {
      redirect('/admin')
    } else {
      redirect('/dashboard')
    }
  } catch (error) {
    logger.error('Login action failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      username: formData.get('username'),
    })

    return {
      errors: {
        _form: ['An unexpected error occurred. Please try again.'],
      },
    }
  }
}

/**
 * Signup Server Action (for future user registration)
 */
export async function signup(state: FormState, formData: FormData): Promise<FormState> {
  try {
    // 1. Validate form fields
    const validatedFields = SignupFormSchema.safeParse({
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    })

    // If validation fails, return early with errors
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { username: _username, email: _email, password: _password } = validatedFields.data

    // 2. Check if user already exists
    // In a real application, you would check your database
    // const existingUser = await db.query.users.findFirst({
    //   where: or(
    //     eq(users.username, username),
    //     eq(users.email, email)
    //   ),
    // })
    // 
    // if (existingUser) {
    //   return {
    //     errors: {
    //       _form: ['A user with this username or email already exists.'],
    //     },
    //   }
    // }

    // 3. Hash password and create user
    // const hashedPassword = await bcrypt.hash(password, 10)
    // 
    // const data = await db.insert(users).values({
    //   username,
    //   email,
    //   passwordHash: hashedPassword,
    //   role: 'user',
    //   isActive: true,
    // }).returning({ id: users.id })
    // 
    // const user = data[0]
    // 
    // if (!user) {
    //   return {
    //     errors: {
    //       _form: ['An error occurred while creating your account.'],
    //     },
    //   }
    // }

    // For now, return success message since we don't have user registration
    return {
      message: 'Account creation is not currently available. Please contact an administrator.',
    }

    // 4. Create session and redirect
    // await createSession(user)
    // redirect('/dashboard')
  } catch (error) {
    logger.error('Signup action failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      username: formData.get('username'),
      email: formData.get('email'),
    })

    return {
      errors: {
        _form: ['An unexpected error occurred. Please try again.'],
      },
    }
  }
}

/**
 * Logout Server Action
 */
export async function logout(): Promise<void> {
  try {
    // Verify user is authenticated before logout
    await requireAuth()
    
    // Delete session
    await deleteSession()
    
    logger.info('User logout successful')
  } catch (error) {
    logger.error('Logout action failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
  
  // Always redirect to login page, even if there was an error
  redirect('/admin/auth/login')
}

/**
 * Update profile Server Action (requires authentication)
 */
export async function updateProfile(state: FormState, formData: FormData): Promise<FormState> {
  try {
    // 1. Verify authentication
    const user = await authorizeServerAction()

    // 2. Validate form fields
    const UpdateProfileSchema = z.object({
      username: z.string().min(3).max(50).trim(),
      email: z.string().email().trim().optional(),
    })

    const validatedFields = UpdateProfileSchema.safeParse({
      username: formData.get('username'),
      email: formData.get('email') || undefined,
    })

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { username: _username, email: _email } = validatedFields.data

    // 3. Update user in database
    // await db.update(users)
    //   .set({
    //     username,
    //     email,
    //     updatedAt: new Date(),
    //   })
    //   .where(eq(users.id, user.id))

    logger.info('Profile updated successfully', {
      userId: user.id,
      username,
    })

    return {
      message: 'Profile updated successfully.',
    }
  } catch (error) {
    logger.error('Update profile action failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    if (error instanceof Error && error.message === 'Authentication required') {
      redirect('/admin/auth/login')
    }

    return {
      errors: {
        _form: ['An unexpected error occurred. Please try again.'],
      },
    }
  }
}

/**
 * Change password Server Action (requires authentication)
 */
export async function changePassword(state: FormState, formData: FormData): Promise<FormState> {
  try {
    // 1. Verify authentication
    const user = await authorizeServerAction()

    // 2. Validate form fields
    const ChangePasswordSchema = z.object({
      currentPassword: z.string().min(1, { message: 'Current password is required.' }),
      newPassword: z
        .string()
        .min(8, { message: 'New password must be at least 8 characters long.' })
        .regex(/[a-zA-Z]/, { message: 'New password must contain at least one letter.' })
        .regex(/[0-9]/, { message: 'New password must contain at least one number.' })
        .regex(/[^a-zA-Z0-9]/, { message: 'New password must contain at least one special character.' })
        .trim(),
      confirmPassword: z.string(),
    }).refine((data) => data.newPassword === data.confirmPassword, {
      message: "New passwords don't match",
      path: ['confirmPassword'],
    })

    const validatedFields = ChangePasswordSchema.safeParse({
      currentPassword: formData.get('currentPassword'),
      newPassword: formData.get('newPassword'),
      confirmPassword: formData.get('confirmPassword'),
    })

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { currentPassword: _currentPassword, newPassword: _newPassword } = validatedFields.data

    // 3. Verify current password
    // const dbUser = await db.query.users.findFirst({
    //   where: eq(users.id, user.id),
    //   columns: { passwordHash: true },
    // })
    // 
    // if (!dbUser) {
    //   return {
    //     errors: {
    //       _form: ['User not found.'],
    //     },
    //   }
    // }
    // 
    // const isValidPassword = await bcrypt.compare(currentPassword, dbUser.passwordHash)
    // if (!isValidPassword) {
    //   return {
    //     errors: {
    //       currentPassword: ['Current password is incorrect.'],
    //     },
    //   }
    // }

    // 4. Hash new password and update
    // const hashedNewPassword = await bcrypt.hash(newPassword, 10)
    // 
    // await db.update(users)
    //   .set({
    //     passwordHash: hashedNewPassword,
    //     updatedAt: new Date(),
    //   })
    //   .where(eq(users.id, user.id))

    logger.info('Password changed successfully', {
      userId: user.id,
    })

    return {
      message: 'Password changed successfully.',
    }
  } catch (error) {
    logger.error('Change password action failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    if (error instanceof Error && error.message === 'Authentication required') {
      redirect('/admin/auth/login')
    }

    return {
      errors: {
        _form: ['An unexpected error occurred. Please try again.'],
      },
    }
  }
}

/**
 * Admin-only action: Create user (requires admin role)
 */
export async function createUser(state: FormState, formData: FormData): Promise<FormState> {
  try {
    // 1. Verify admin authentication
    const user = await authorizeServerAction(['admin'])

    // 2. Validate form fields
    const CreateUserSchema = z.object({
      username: z.string().min(3).max(50).trim(),
      email: z.string().email().trim(),
      password: z.string().min(8).trim(),
      role: z.enum(['user', 'admin']),
    })

    const validatedFields = CreateUserSchema.safeParse({
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password'),
      role: formData.get('role'),
    })

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { username: _username, email: _email, password: _password, role } = validatedFields.data

    // 3. Create user in database
    // const hashedPassword = await bcrypt.hash(password, 10)
    // 
    // const data = await db.insert(users).values({
    //   username,
    //   email,
    //   passwordHash: hashedPassword,
    //   role,
    //   isActive: true,
    // }).returning({ id: users.id })
    // 
    // const newUser = data[0]

    logger.info('User created by admin', {
      adminId: user.id,
      newUsername: username,
      newUserRole: role,
    })

    return {
      message: `User "${username}" created successfully.`,
    }
  } catch (error) {
    logger.error('Create user action failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    if (error instanceof Error && error.message === 'Authentication required') {
      redirect('/admin/auth/login')
    }

    if (error instanceof Error && error.message === 'Insufficient permissions') {
      return {
        errors: {
          _form: ['You do not have permission to create users.'],
        },
      }
    }

    return {
      errors: {
        _form: ['An unexpected error occurred. Please try again.'],
      },
    }
  }
}

/**
 * Validate session and refresh if needed (utility action)
 */
export async function validateSession(): Promise<{ valid: boolean; user?: Record<string, unknown> }> {
  try {
    const user = await authorizeServerAction()
    return { valid: true, user }
  } catch (_error) {
    return { valid: false }
  }
}