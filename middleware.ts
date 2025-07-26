import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'tutedude-b2b-secure-jwt-secret-key-2025';

// Routes that require authentication
const PROTECTED_ROUTES = ['/vendor/dashboard'];
// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ['/vendor'];

// Simple JWT verification using Web API (compatible with Edge Runtime)
async function verifyJWT(token: string, secret: string) {
  try {
    // Split the token
    const [headerB64, payloadB64, signatureB64] = token.split('.');

    if (!headerB64 || !payloadB64 || !signatureB64) {
      throw new Error('Invalid token format');
    }

    // Decode payload to check expiration
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));

    // Check if token is expired
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      throw new Error('Token expired');
    }

    // Create signature to verify
    const encoder = new TextEncoder();
    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const secretKey = encoder.encode(secret);

    // Import secret as crypto key
    const key = await crypto.subtle.importKey(
      'raw',
      secretKey,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // Generate signature
    const signature = await crypto.subtle.sign('HMAC', key, data);
    const expectedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    // Compare signatures
    if (expectedSignature !== signatureB64) {
      throw new Error('Invalid signature');
    }

    return payload;
  } catch (error) {
    throw error;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the token from cookies
  const token = request.cookies.get('vendorToken')?.value;

  try {
    // If there's a token, verify it
    if (token) {
      try {
        await verifyJWT(token, JWT_SECRET);
        console.log('Token verified successfully for path:', pathname);

        // If user is authenticated and trying to access login page, redirect to dashboard
        if (AUTH_ROUTES.some(route => pathname.startsWith(route)) && pathname === '/vendor') {
          console.log('Redirecting authenticated user from /vendor to /vendor/dashboard');
          return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        // If token is invalid, clear the cookie and redirect to login for protected routes
        if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
          console.log('Clearing invalid token and redirecting to /vendor');
          const response = NextResponse.redirect(new URL('/vendor', request.url));
          response.cookies.delete('vendorToken');
          return response;
        }
      }
    } else {
      // If no token and trying to access protected route, redirect to login
      if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
        console.log('No token found, redirecting to /vendor');
        return NextResponse.redirect(new URL('/vendor', request.url));
      }
    }
  } catch (error) {
    console.error('Middleware error:', error);
  }

  return NextResponse.next();
}

// Specify which routes this middleware should run on
export const config = {
  matcher: ['/vendor', '/vendor/dashboard/:path*']
};
