// ============================================================================
// FILE: app/api/auth/set-cookie/route.ts - ✅ WITH USER_ROLE COOKIE
// ============================================================================
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📥 Set-cookie received:', body);

    const { token, role } = body;

    if (!token) {
      console.error('❌ No token provided');
      return NextResponse.json(
        { success: false, message: 'Token is required' },
        { status: 400 }
      );
    }

    // Create response
    const response = NextResponse.json({ 
      success: true,
      message: 'Cookies set successfully' 
    });

    // ✅ Set access_token cookie (httpOnly=true for XSS protection)
    response.cookies.set({
      name: 'access_token',
      value: token,
      httpOnly: true, // 🔒 SECURITY: Prevent JavaScript access (XSS protection)
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // ✅ Set user_role cookie (PENTING UNTUK MIDDLEWARE!)
    if (role) {
      response.cookies.set({
        name: 'user_role',
        value: role,
        httpOnly: true, // 🔒 SECURITY: Prevent JavaScript access (XSS protection)
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
      console.log('✅ user_role cookie set:', role);
    }

    console.log('✅ Cookies set successfully');
    return response;

  } catch (error) {
    console.error('❌ Error in set-cookie:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to set cookies' },
      { status: 500 }
    );
  }
}