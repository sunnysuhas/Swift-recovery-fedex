
import { db } from '../lib/db';
import { cases, slaTracking } from '../lib/db/schema';
import { eq, and, lt, ne } from 'drizzle-orm';

/**
 * SLA Monitor Task
 * Checks for cases that are 'In Progress' but haven't had updates or payments in X days.
 */
async function monitorSla() {
    console.log('Running SLA Monitor...');

    // 1. Get Active Cases (New or In Progress)
    const activeCases = await db.select().from(cases)
        .where(and(ne(cases.status, 'Paid'), ne(cases.status, 'Closed')));

    let breachCount = 0;
    const now = new Date();

    for (const c of activeCases) {
        // Simple SLA Rule: Case > 90 days aging with High Priority must have recent update (7d)
        // This is a simplified logic check

        let urgency = 0;
        let isBreach = false;

        // Check if deadline exists in sla_tracking, if not create
        const slaRecord = await db.select().from(slaTracking).where(eq(slaTracking.caseId, c.id));

        if (c.priorityScore > 80 && c.aging > 60) {
            urgency = 10; // Critical
            // If no update in last 7 days (mock logic for update check)
            // In real app we check c.updatedAt
            const daysSinceUpdate = (now.getTime() - (c.updatedAt || c.createdAt)!.getTime()) / (1000 * 3600 * 24);
            if (daysSinceUpdate > 7) {
                isBreach = true;
            }
        }

        // Update Case SLA Status
        if (isBreach) {
            console.log(`[BREACH] Case ${c.id} is overdue for action.`);
            await db.update(cases).set({ slaStatus: 'Breached', slaUrgency: urgency }).where(eq(cases.id, c.id));

            // Log to SLA Tracking
            if (slaRecord.length === 0) {
                await db.insert(slaTracking).values({
                    id: `sla_${c.id}`,
                    caseId: c.id,
                    status: 'Breached',
                    breachFlag: true,
                    createdAt: new Date()
                });
            } else {
                await db.update(slaTracking).set({ status: 'Breached', breachFlag: true }).where(eq(slaTracking.id, slaRecord[0].id));
            }

            breachCount++;
            // Simulate sending email alert
            // sendEmail(c.ownerId, "SLA Breach Alert", ...);
        }
    }

    console.log(`SLA Check Complete. Found ${breachCount} breaches.`);
}

monitorSla().catch(console.error);
