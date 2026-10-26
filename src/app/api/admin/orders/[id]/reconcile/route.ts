import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAccess } from '@/lib/admin-auth';
import { reconcileOrderStatus } from '@/lib/fulfillment-queue';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verifyAdminAccess(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = params;
    const result = await reconcileOrderStatus(id);

    return NextResponse.json({
      success: result.reconciled,
      ...result,
    });
  } catch (error: any) {
    console.error('Reconciliation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Status reconciliation failed' },
      { status: 500 }
    );
  }
}
