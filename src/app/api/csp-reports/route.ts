
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const report = await request.json();
  console.error('CSP Violation:', report);
  return new NextResponse(null, { status: 204 });
}
