'use server';

import { db } from '@/lib/db';
import { auditLogs } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function getAuditLogs(caseId: string) {
    return await db.select().from(auditLogs).where(eq(auditLogs.caseId, caseId)).orderBy(desc(auditLogs.timestamp));
}

export async function createAuditLog(log: any) {
    await db.insert(auditLogs).values({
        ...log,
        timestamp: new Date()
    });
    return log;
}
