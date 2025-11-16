// ============================================================================
// FILE: middleware.ts - WITH DETAILED DEBUG
// ============================================================================
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UserRole } from "./types/enums";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;
  const userRole = request.cookies.get("user_role")?.value as UserRole;
  
  // ✅ DETAILED DEBUG
  console.log('🔄 ===== MIDDLEWARE DEBUG =====');
  console.log('📍 Pathname:', pathname);
  console.log('🍪 Has Token:', !!token);
  console.log('🍪 Token Value:', token ? token.substring(0, 30) + '...' : 'NONE');
  console.log('👤 User Role:', userRole || 'NONE');
  console.log('🍪 All Cookies:', request.cookies.getAll().map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...' })));
  console.log('================================');
  
  // ========================================
  // 1. SKIP: Static files, API, /home
  // ========================================
  const skipPaths = ['/api', '/_next', '/favicon', '/home', '/layanan'];
  if (
    skipPaths.some(path => pathname.startsWith(path)) ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff|woff2|ttf)$/)
  ) {
    console.log('⏭️  Skipping middleware for:', pathname);
    return NextResponse.next();
  }
  
  // ========================================
  // 2. ALLOW: Error pages
  // ========================================
  const errorPages = ['/403', '/404', '/500', '/_not-found', '/401', '/network-error'];
  if (errorPages.includes(pathname)) {
    console.log('🚨 Allowing error page:', pathname);
    return NextResponse.next();
  }
  
  // ========================================
  // 3. AUTH ROUTES: /login, /register
  // ========================================
  const authRoutes = ["/login", "/register"];
  const isAuthRoute = authRoutes.includes(pathname);
  
  if (isAuthRoute) {
    if (token && userRole) {
      console.log('✅ Already logged in, redirecting from auth page');
      console.log('   Token exists:', !!token);
      console.log('   Role:', userRole);

      const url = request.nextUrl.clone();

      if (userRole === UserRole.KLIEN) {
        console.log('✅ KLIEN → redirect to dashboard (filtered view)');
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }

      console.log('✅ OTHER ROLE → redirect to dashboard');
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    
    console.log('👤 User not logged in, showing auth page');
    return NextResponse.next();
  }
  
  // ========================================
  // 4. ROOT "/" - LANDING PAGE (PUBLIC)
  // ========================================
  if (pathname === "/") {
    console.log('🏠 Root path, showing landing page');
    return NextResponse.next();
  }
  
  // ========================================
  // 5. PROTECTED ROUTES (/dashboard/*)
  // ========================================
  
  if (!token) {
    console.log('❌ No token, redirecting to login');
    console.log('   From path:', pathname);
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  
  if (!userRole) {
    console.log('❌ No role, clearing cookies and redirecting to login');
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("access_token");
    response.cookies.delete("user_role");
    return response;
  }
  
  // ========================================
  // 6. KLIEN ROLE - BLOCKED FROM WEB ADMIN
  // ========================================
  // This is an INTERNAL admin dashboard - KLIEN should not have access
  if (userRole === UserRole.KLIEN) {
    console.log('🚫 KLIEN cannot access admin dashboard - this is for internal staff only');
    const url = request.nextUrl.clone();
    url.pathname = "/403";
    return NextResponse.redirect(url);
  }

  console.log('✅ Access granted for:', userRole);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};