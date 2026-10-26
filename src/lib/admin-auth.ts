import { NextRequest } from 'next/server';

export function verifyAdminAccess(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET_KEY || 'aeromach_dev_admin_key_2026';

  // Check header
  const headerKey = request.headers.get('x-admin-key');
  if (headerKey && headerKey === secret) {
    return true;
  }

  // Check authorization bearer
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token === secret) return true;
  }

  // Check cookie
  const cookie = request.cookies.get('aeromach_admin_auth');
  if (cookie && cookie.value === secret) {
    return true;
  }

  return false;
}
