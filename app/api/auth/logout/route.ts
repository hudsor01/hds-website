import { NextRequest, NextResponse } from 'next/server';
import { createTRPCContext } from '@/app/api/trpc/lib/trpc';
import { apiRouter } from '@/app/api/trpc/routers/unified-router';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Create tRPC context
    const ctx = await createTRPCContext({ req: request });
    
    // Create caller
    const caller = apiRouter.createCaller(ctx);
    
    // Call the tRPC procedure
    const result = await caller.auth.logout();
    
    // Create response and clear auth cookie
    const response = NextResponse.json(result, { status: 200 });
    
    // Clear the auth token cookie
    response.cookies.delete('auth_token');
    
    return response;
  } catch (error) {
    logger.error('Auth logout API error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof Error && 'code' in error) {
      const status = error.code === 'UNAUTHORIZED' ? 401 : 500;
      return NextResponse.json(
        { 
          success: false, 
          error: error.message, 
        },
        { status },
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Logout failed', 
      },
      { status: 500 },
    );
  }
}