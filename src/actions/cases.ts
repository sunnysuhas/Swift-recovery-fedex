'use server';

import { db } from '@/lib/db';
import { cases } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
// import { revalidatePath } from 'next/cache'; // If needed

export async function getCases(userId?: string, role?: string) {
    let result;

    // If Admin, fetch all. If DCA_Agent (or other), fetch only owned cases.
    if (role === 'Admin') {
        result = await db.select().from(cases).orderBy(desc(cases.createdAt));
    } else if (userId) {
        result = await db.select().from(cases).where(eq(cases.ownerId, userId)).orderBy(desc(cases.createdAt));
    } else {
        // Fallback for no auth context (shouldn't happen in logic but safe default)
        return [];
    }

    return result.map(c => ({
        ...c,
        assignedDCA: c.assignedDcaId,
        debtor: {
            name: c.debtorName,
            accountId: c.debtorAccountId
        },
    }));
}

export async function getCase(id: string) {
    const result = await db.select().from(cases).where(eq(cases.id, id)).limit(1);
    if (result.length === 0) return null;
    const c = result[0];
    return {
        ...c,
        assignedDCA: c.assignedDcaId,
        debtor: {
            name: c.debtorName,
            accountId: c.debtorAccountId
        },
    };
}

export async function updateCase(id: string, data: any) {
    if (data.caseHistory && Array.isArray(data.caseHistory)) {
        data.caseHistory = JSON.stringify(data.caseHistory);
    }
    await db.update(cases).set({ ...data, updatedAt: new Date() }).where(eq(cases.id, id));
    return { id, ...data };
}

export async function createCase(data: any, ownerId?: string) {
    const newCase = {
        id: data.id || `case-${Math.random().toString(36).substr(2, 9)}`,
        debtorName: data.debtor?.name,
        debtorAccountId: data.debtor?.accountId,
        amount: data.amount,
        currency: data.currency || 'USD',
        aging: data.aging,
        priorityScore: data.priorityScore,
        status: data.status || 'New',
        assignedDcaId: data.assignedDCA,
        slaStatus: data.slaStatus,
        paymentBehavior: data.paymentBehavior,
        caseHistory: typeof data.caseHistory === 'string' ? data.caseHistory : JSON.stringify(data.caseHistory),
        actionPlan: data.actionPlan,
        ownerId: ownerId, // Save owner
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    await db.insert(cases).values(newCase);
    return newCase;
}

export async function batchCreateCases(items: any[], ownerId?: string) {
    const values = items.map(data => ({
        id: data.id || `case-${Math.random().toString(36).substr(2, 9)}`,
        debtorName: data.debtor?.name,
        debtorAccountId: data.debtor?.accountId,
        amount: data.amount,
        currency: data.currency || 'USD',
        aging: data.aging,
        priorityScore: data.priorityScore,
        status: data.status || 'New',
        assignedDcaId: data.assignedDCA,
        slaStatus: data.slaStatus,
        paymentBehavior: data.paymentBehavior,
        caseHistory: typeof data.caseHistory === 'string' ? data.caseHistory : JSON.stringify(data.caseHistory),
        actionPlan: data.actionPlan,
        ownerId: ownerId, // Save owner
        createdAt: new Date(),
        updatedAt: new Date(),
    }));

    if (values.length > 0) {
        await db.insert(cases).values(values).onConflictDoUpdate({
            target: cases.id,
            set: {
                debtorName: sql`excluded.debtor_name`,
                debtorAccountId: sql`excluded.debtor_account_id`,
                amount: sql`excluded.amount`,
                currency: sql`excluded.currency`,
                aging: sql`excluded.aging`,
                priorityScore: sql`excluded.priority_score`,
                status: sql`excluded.status`,
                assignedDcaId: sql`excluded.assigned_dca_id`,
                slaStatus: sql`excluded.sla_status`,
                paymentBehavior: sql`excluded.payment_behavior`,
                caseHistory: sql`excluded.case_history`,
                actionPlan: sql`excluded.action_plan`,
                ownerId: sql`excluded.owner_id`, // Update owner on re-import? Maybe yes.
                updatedAt: new Date(),
            }
        });
    }
    return { count: values.length };
}
