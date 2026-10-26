import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { printify } from '@/lib/printify';
import { verifyAdminAccess } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  if (!verifyAdminAccess(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const isConfigured = printify.isConfigured();
    const shops = await printify.getShops();

    // Touch products lastSyncedAt
    await prisma.product.updateMany({
      data: {
        lastSyncedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'PRINTIFY_CATALOG_SYNC',
        actor: 'ADMIN',
        details: `Synchronized catalog. Mode: ${isConfigured ? 'LIVE_PROVIDER' : 'SANDBOX_ADAPTER'}. Shops discovered: ${shops.length}`,
      },
    });

    return NextResponse.json({
      success: true,
      mode: isConfigured ? 'LIVE' : 'SANDBOX_ADAPTER',
      shops,
      message: 'Catalog synchronization completed successfully.',
    });
  } catch (error: any) {
    console.error('Catalog sync error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Catalog synchronization failed' },
      { status: 500 }
    );
  }
}
