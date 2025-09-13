import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  processEmailsEndpoint,
  getEmailQueueStats,
} from "@/lib/scheduled-emails";
import { applySecurityHeaders } from "@/lib/security-headers";

// This endpoint would typically be called by a cron job or scheduled task
// In production, you'd want to secure this endpoint with authentication

export async function POST(request: NextRequest) {
  try {
    // In production, add authentication here
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.CRON_SECRET || "development-only";

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.warn("Processing scheduled emails...");

    const result = await processEmailsEndpoint();

    const response = NextResponse.json({
      success: result.success,
      message: `Processed ${result.processed} emails, ${result.errors} errors`,
      stats: getEmailQueueStats(),
      timestamp: new Date().toISOString(),
    });

    return applySecurityHeaders(response);
  } catch (error) {
    console.error("Email processing API error:", error);

    const response = NextResponse.json(
      {
        error: "Failed to process emails",
        success: false,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );

    return applySecurityHeaders(response);
  }
}

export async function GET(request: NextRequest) {
  try {
    // Simple endpoint to check email queue status
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.CRON_SECRET || "development-only";

    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = getEmailQueueStats();

    const response = NextResponse.json({
      stats,
      timestamp: new Date().toISOString(),
    });

    return applySecurityHeaders(response);
  } catch (error) {
    console.error("Email stats API error:", error);

    const response = NextResponse.json(
      { error: "Failed to get email stats" },
      { status: 500 }
    );

    return applySecurityHeaders(response);
  }
}
