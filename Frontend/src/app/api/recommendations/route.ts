
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const itemId = searchParams.get('item_id');
    const limit = searchParams.get('limit') || '8';

    if (!userId && !itemId) {
        return NextResponse.json({ error: 'Missing user_id or item_id' }, { status: 400 });
    }

    try {
        // Construct backend URL
        const backendUrl = new URL('http://127.0.0.1:8080/api/v1/recommendations/');
        if (userId) backendUrl.searchParams.append('user_id', userId);
        if (itemId) backendUrl.searchParams.append('item_id', itemId);
        backendUrl.searchParams.append('limit', limit);

        console.log(`Proxying recommendation request to: ${backendUrl.toString()}`);

        const res = await fetch(backendUrl.toString(), {
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            console.error(`Backend returned ${res.status}`);
            return NextResponse.json({ error: 'Backend error' }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
