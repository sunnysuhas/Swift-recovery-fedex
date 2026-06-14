'use server';

import { db } from '@/lib/db';
import { cases, auditLogs } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export async function getCases(userId?: string, role?: string) {
    let result;

    if (role === 'Admin') {
        result = await db.select().from(cases).orderBy(desc(cases.createdAt));
    } else if (userId) {
        result = await db.select().from(cases).where(eq(cases.ownerId, userId)).orderBy(desc(cases.createdAt));
    } else {
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
        ownerId: ownerId,
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
        ownerId: ownerId,
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
                ownerId: sql`excluded.owner_id`,
                updatedAt: new Date(),
            }
        });
    }
    return { count: values.length };
}

// RPA SLA Escalation Action
export async function triggerRpaEscalationAction(caseId: string) {
    try {
        const now = new Date();
        const result = await db.select().from(cases).where(eq(cases.id, caseId)).limit(1);
        if (result.length === 0) throw new Error('Case not found');
        const c = result[0];

        // Deserialize case history, append event
        let historyList = [];
        if (c.caseHistory) {
            try {
                historyList = JSON.parse(c.caseHistory);
            } catch (err) {
                historyList = [];
            }
        }

        historyList.push({
            date: now.toLocaleDateString(),
            action: 'RPA Escalation Dispatched',
            details: 'System automatically triggered demand letter generation and notified primary agency managers.'
        });

        // Update DB
        await db.update(cases)
            .set({
                slaStatus: 'Breached',
                slaUrgency: 10,
                caseHistory: JSON.stringify(historyList),
                updatedAt: now,
            })
            .where(eq(cases.id, caseId));

        // Create audit log entry
        await db.insert(auditLogs).values({
            id: `audit_sla_${caseId}_${Date.now()}`,
            caseId,
            userId: 'rpa_agent_id',
            userEmail: 'rpa@recoveryos.com',
            action: 'RPA Auto-Escalation',
            details: 'Dispatched warning email and demand brief. Caseload urgency flagged critical.',
            timestamp: now
        });

        return { success: true };
    } catch (e: any) {
        console.error('Failed to run RPA escalation:', e);
        throw new Error(e.message || 'RPA escalation fail');
    }
}
