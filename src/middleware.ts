// Nexora — Middleware Placeholder
// ================================
// This file will be configured in Milestone 4 (Authentication)
// to protect dashboard routes using Auth.js v5.
//
// Next.js 16 recommends the "proxy" convention for advanced use cases.
// We will evaluate the best approach during the auth milestone.
//
// For now, this is an empty middleware that passes all requests through.

import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  // No routes matched yet — effectively a no-op.
  matcher: [],
};
