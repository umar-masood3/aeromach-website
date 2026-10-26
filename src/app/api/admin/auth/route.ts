import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json();
    const expectedKey = process.env.ADMIN_SECRET_KEY || 'aeromach_dev_admin_key_2026';

    if (key === expectedKey) {
      const response = NextResponse.json({ success: true });
      response.cookies.set('aeromach_admin_auth', expectedKey, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      return response;
    }

    return NextResponse.json(
      { success: false, error: 'Invalid administrative security key' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.delete('aeromach_admin_auth');
  return response;
}
