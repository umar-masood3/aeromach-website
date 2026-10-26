import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    const where: any = { isPublished: true };
    if (category && category !== 'all') {
      where.category = category;
    }
    if (featured === 'true') {
      where.isFeatured = true;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        variants: {
          where: { isAvailable: true },
          select: {
            id: true,
            title: true,
            size: true,
            color: true,
            colorHex: true,
            sku: true,
            price: true,
            isAvailable: true,
            // Exclude costPrice to protect internal costs
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const parsedProducts = products.map((p) => ({
      ...p,
      images: JSON.parse(p.images),
      specifications: p.specifications ? JSON.parse(p.specifications) : null,
    }));

    return NextResponse.json({ success: true, products: parsedProducts });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve products' },
      { status: 500 }
    );
  }
}
