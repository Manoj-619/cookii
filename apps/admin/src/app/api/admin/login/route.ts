import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate email and password
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Default admin creds or accept valid admin emails
    const validEmails = ['ops@zapeat.online', 'admin@zapeat.online', 'ops@ZapEat.in', 'admin@ZapEat.com', 'admin@ZapEat.in'];
    const isValid =
      validEmails.includes(email.toLowerCase()) ||
      email.includes('@zapeat.') ||
      email.includes('@ZapEat.') ||
      (password.length >= 6 && email.includes('@'));

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin credentials' },
        { status: 401 }
      );
    }

    // Create session token
    const token = `ZapEat_admin_jwt_${Buffer.from(
      JSON.stringify({
        email,
        role: 'ADMIN',
        timestamp: Date.now(),
      })
    ).toString('base64')}`;

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: 'admin-ops-01',
        name: 'Priya Sharma',
        email,
        role: 'ADMIN',
        designation: 'Senior Ops Lead (Bengaluru)',
      },
    });

    // Set cookie
    response.cookies.set({
      name: 'ZapEat_admin_token',
      value: token,
      httpOnly: false, // allow client-side hydration as well
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
