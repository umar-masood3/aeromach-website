import { NextRequest, NextResponse } from 'next/server';
import { calculateOrderPricing } from '@/lib/pricing';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, country } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Items array is required and must not be empty.' },
        { status: 400 }
      );
    }

    const pricing = await calculateOrderPricing(items, country || 'India');

    return NextResponse.json({
      success: true,
      pricing,
    });
  } catch (error: any) {
    console.error('Pricing calculation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error calculating order pricing' },
      { status: 400 }
    );
  }
}
