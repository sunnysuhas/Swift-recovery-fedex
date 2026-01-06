
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { payments, cases } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { caseId, amount, notes } = body;

        if (!caseId || !amount) {
            return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
        }

        // 1. Record Payment
        const paymentId = `pay-${Date.now()}`;
        await db.insert(payments).values({
            id: paymentId,
            caseId,
            amount,
            status: 'Completed',
            notes,
            paymentDate: new Date()
        });

        // 2. Update Case Status/Amount?
        // In a real system we might deduct amount or close case.
        // Let's check outstanding.
        const caseRes = await db.select().from(cases).where(eq(cases.id, caseId)).limit(1);
        if (caseRes.length > 0) {
            const c = caseRes[0];
            // If payment covers amount, mark Paid
            // Simplified logic
            if (amount >= (c.amount * 0.9)) {
                await db.update(cases).set({ status: 'Paid', updatedAt: new Date() }).where(eq(cases.id, caseId));
            } else {
                await db.update(cases).set({ status: 'In Progress', updatedAt: new Date() }).where(eq(cases.id, caseId));
            }
        }

        return NextResponse.json({ success: true, paymentId });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Payment failed' }, { status: 500 });
    }
}
