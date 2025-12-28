import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy');

    try {
        const where: any = {};

        if (category && category !== 'All') {
            where.category = {
                name: category
            };
        }

        if (minPrice || maxPrice) {
            where.price = {
                ...(minPrice && { gte: parseFloat(minPrice) }),
                ...(maxPrice && { lte: parseFloat(maxPrice) }),
            };
        }

        let orderBy: any = { createdAt: 'desc' };
        if (sortBy === 'price-low') orderBy = { price: 'asc' };
        if (sortBy === 'price-high') orderBy = { price: 'desc' };
        if (sortBy === 'rating') orderBy = { rating: 'desc' };

        const products = await prisma.product.findMany({
            where,
            orderBy,
            include: {
                category: true
            }
        });

        return NextResponse.json(products);
    } catch (error: any) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Failed to fetch products', message: error.message }, { status: 500 });
    }
}
