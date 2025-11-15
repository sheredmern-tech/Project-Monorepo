import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🔴🔴🔴 LOGOUT API ROUTE CALLED 🔴🔴🔴'); // ✅ Ini HARUS muncul
  
  try {
    console.log('🚪 ===== LOGOUT API DEBUG =====');
    
    const beforeTokenCookie = request.cookies.get('access_token');
    const beforeRoleCookie = request.cookies.get('user_role');
    
    console.log('📋 BEFORE LOGOUT:');
    console.log('   access_token:', beforeTokenCookie ? 'EXISTS' : 'NOT FOUND');
    console.log('   user_role:', beforeRoleCookie?.value || 'NOT FOUND');

    const response = NextResponse.json({ 
      success: true,
      message: 'Logged out successfully' 
    });

    response.cookies.delete('access_token');
    response.cookies.delete('user_role');

    console.log('📋 AFTER LOGOUT:');
    console.log('   Cookies deleted');
    console.log('================================');

    return response;

  } catch (error) {
    console.error('❌ LOGOUT ERROR:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to logout' },
      { status: 500 }
    );
  }
}