
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dcas } from '@/lib/db/schema';

export async function GET(req: NextRequest) {
    try {
        const data = await db.select().from(dcas);
        return NextResponse.json({ success: true, count: data.length, data });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch DCAs' }, { status: 500 });
    }
}
