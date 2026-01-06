
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cases } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const result = await db.select().from(cases).where(eq(cases.id, id)).limit(1);

        if (result.length === 0) {
            return NextResponse.json({ success: false, error: 'Case not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: result[0] });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const body = await req.json();

        // Update
        await db.update(cases)
            .set({ ...body, updatedAt: new Date() })
            .where(eq(cases.id, id));

        return NextResponse.json({ success: true, message: 'Case updated' });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        await db.delete(cases).where(eq(cases.id, id));
        return NextResponse.json({ success: true, message: 'Case deleted' });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Delete failed' }, { status: 500 });
    }
}
