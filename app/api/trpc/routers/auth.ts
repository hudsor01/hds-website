import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../lib/trpc-unified'
import { TRPCError } from '@trpc/server'
import { authenticateAdmin, createAdminSession, verifyAdminToken } from '@/lib/auth/admin'
import { authMiddleware } from '../lib/middleware'

export const authRouter = createTRPCRouter({
  // Admin login endpoint
  login: publicProcedure
    .input(z.object({
      username: z.string().min(1, 'Username is required'),
      password: z.string().min(1, 'Password is required'),
    }))
    .mutation(async ({ input }) => {
      try {
        const isValid = await authenticateAdmin(input.username, input.password)
        
        if (!isValid) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid credentials',
          })
        }

        const token = await createAdminSession(input.username)
        
        return {
          success: true,
          token,
          user: {
            username: input.username,
            role: 'admin',
          },
        }
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }
        
        console.error('Login error:', error)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Authentication failed',
        })
      }
    }),

  // Logout endpoint
  logout: publicProcedure
    .use(authMiddleware)
    .mutation(async () => 
      // For JWT tokens, logout is typically handled client-side by removing the token
      // Server-side logout would require token blacklisting which we'll implement later if needed
       ({
        success: true,
        message: 'Logged out successfully',
      }),
    ),

  // Verify current session
  verifySession: publicProcedure
    .use(authMiddleware)
    .query(async ({ ctx }) => {
      const user = ctx.user
      
      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'No active session',
        })
      }

      return {
        user: {
          username: user.username,
          role: user.role,
        },
        isAuthenticated: true,
      }
    }),

  // Get current user info
  me: publicProcedure
    .use(authMiddleware)
    .query(async ({ ctx }) => {
      const user = ctx.user
      
      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
        })
      }

      return {
        username: user.username,
        role: user.role,
        lastLogin: new Date().toISOString(),
      }
    }),
})