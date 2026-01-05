'use server';

import { db } from '@/lib/db';
import { cases } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
// import { revalidatePath } from 'next/cache'; // If needed

export async function getCases() {
    const result = await db.select().from(cases).orderBy(desc(cases.createdAt));
    // Parse JSON fields if necessary (like debtor if we stored it as string, but sqlite schema has specific columns? 
    // Wait, in schema I put debtorName/debtorAccountId on root for simplicity but the Type expects nested debtor object.
    // I should adapt the return type to match Case interface or update the Interface.
    // Ideally, I'll map it to the Case type.
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

export async function createCase(data: any) {
    // data matches the Case interface partially.
    // We need to map it to the DB schema
    const newCase = {
        id: data.id || `case-${Math.random().toString(36).substr(2, 9)}`,
        debtorName: data.debtor?.name,
        debtorAccountId: data.debtor?.accountId,
        amount: data.amount,
        currency: data.currency || 'USD',
        aging: data.aging,
        priorityScore: data.priorityScore,
        status: data.status || 'New',
        assignedDcaId: data.assignedDCA, // Map known field
        slaStatus: data.slaStatus,
        paymentBehavior: data.paymentBehavior,
        caseHistory: typeof data.caseHistory === 'string' ? data.caseHistory : JSON.stringify(data.caseHistory),
        actionPlan: data.actionPlan,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    await db.insert(cases).values(newCase);
    return newCase;
}

export async function batchCreateCases(items: any[]) {
    // Drizzle doesn't strictly have "batch" in one query for sqlite always, but we can loop (better-sqlite3 is synchronous/fast)
    // or use .values([...array]) if supported.
    // Mapping first
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
        createdAt: new Date(),
        updatedAt: new Date(),
    }));

    if (values.length > 0) {
        await db.insert(cases).values(values);
    }
    return { count: values.length };
}
