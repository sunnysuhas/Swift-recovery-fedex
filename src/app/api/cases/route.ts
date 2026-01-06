
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cases } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const status = searchParams.get('status');
        const dcaId = searchParams.get('dcaId');
        const ownerId = searchParams.get('ownerId');
        const limit = parseInt(searchParams.get('limit') || '50');

        const filters = [];
        if (status) filters.push(eq(cases.status, status));
        if (dcaId) filters.push(eq(cases.assignedDcaId, dcaId));
        if (ownerId) filters.push(eq(cases.ownerId, ownerId));

        const data = await db.select()
            .from(cases)
            .where(and(...filters))
            .orderBy(desc(cases.createdAt))
            .limit(limit);

        return NextResponse.json({ success: true, count: data.length, data });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch cases' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Basic validation
        if (!body.amount || !body.debtorName) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const newCase = {
            id: body.id || `case-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            debtorName: body.debtorName,
            debtorAccountId: body.debtorAccountId,
            amount: body.amount,
            currency: body.currency || 'USD',
            aging: body.aging || 0,
            status: body.status || 'New',
            priorityScore: body.priorityScore || 0,
            assignedDcaId: body.assignedDcaId,
            ownerId: body.ownerId, // In real app, get from session
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.insert(cases).values(newCase);

        return NextResponse.json({ success: true, data: newCase }, { status: 201 });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to create case' }, { status: 500 });
    }
}
