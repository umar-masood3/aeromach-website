import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { printify } from '@/lib/printify';
import { razorpayService } from '@/lib/razorpay';
import { verifyAdminAccess } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  if (!verifyAdminAccess(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Database check
    let dbStatus = 'HEALTHY';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'DEGRADED';
    }

    // 2. Printify check
    const printifyConfigured = printify.isConfigured();
    let printifyConnection = 'UNCONFIGURED_SANDBOX_ADAPTER';
    if (printifyConfigured) {
      try {
        await printify.getShops();
        printifyConnection = 'CONNECTED';
      } catch (e: any) {
        printifyConnection = 'CONNECTION_ERROR';
      }
    }

    // 3. Razorpay check
    const razorpayConfigured = razorpayService.isConfigured();

    // 4. Jobs & Webhooks
    const [pendingJobs, failedJobs, failedWebhooks, lastSyncProduct] = await Promise.all([
      prisma.fulfillmentJob.count({ where: { status: 'PENDING' } }),
      prisma.fulfillmentJob.count({ where: { status: 'FAILED' } }),
      prisma.webhookEvent.count({ where: { status: 'FAILED' } }),
      prisma.product.findFirst({
        where: { lastSyncedAt: { not: null } },
        orderBy: { lastSyncedAt: 'desc' },
        select: { lastSyncedAt: true },
      }),
    ]);

    // Check missing environment variables (without revealing values)
    const envStatus = {
      DATABASE_URL: Boolean(process.env.DATABASE_URL),
      PRINTIFY_API_TOKEN: printifyConfigured,
      PRINTIFY_SHOP_ID: Boolean(process.env.PRINTIFY_SHOP_ID),
      RAZORPAY_KEY_ID: razorpayConfigured,
      RAZORPAY_KEY_SECRET: razorpayConfigured,
      RAZORPAY_WEBHOOK_SECRET: Boolean(process.env.RAZORPAY_WEBHOOK_SECRET),
      ADMIN_SECRET_KEY: Boolean(process.env.ADMIN_SECRET_KEY),
      ENABLE_TEST_PAYMENT_SIMULATOR: process.env.ENABLE_TEST_PAYMENT_SIMULATOR === 'true',
    };

    return NextResponse.json({
      success: true,
      health: {
        database: dbStatus,
        printify: {
          configured: printifyConfigured,
          status: printifyConnection,
          mode: printifyConfigured ? 'LIVE' : 'SANDBOX_MOCK',
          lastSync: lastSyncProduct?.lastSyncedAt || null,
        },
        payment: {
          configured: razorpayConfigured,
          provider: 'RAZORPAY',
          mode: razorpayConfigured ? 'LIVE_SANDBOX' : 'TEST_SIMULATOR',
        },
        jobs: {
          pending: pendingJobs,
          failed: failedJobs,
        },
        webhooks: {
          failedEvents: failedWebhooks,
        },
        envStatus,
      },
    });
  } catch (error: any) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { success: false, error: 'Health check failed' },
      { status: 500 }
    );
  }
}
