
import { db } from '../lib/db';
import { cases, dcas } from '../lib/db/schema';
import { eq, isNull } from 'drizzle-orm';
import { recommendDca } from '../lib/logic/matching';
import { calculatePriorityScore } from '../lib/logic/priority';

async function runAutomation() {
    console.log('Running Auto-Assignment Automation...');

    // 1. Fetch Unassigned Cases
    const unassignedCases = await db.select().from(cases).where(isNull(cases.assignedDcaId));
    console.log(`Found ${unassignedCases.length} unassigned cases.`);

    // 2. Fetch Active DCAs
    const allDcas = await db.select().from(dcas);

    // 3. Process each case
    let assignedCount = 0;

    for (const c of unassignedCases) {
        // Calculate Priority if not set
        if (!c.priorityScore) {
            const urgency = 0; // simplified
            const score = calculatePriorityScore({
                recoveryProbability: c.recoveryProbability || 50,
                amount: c.amount,
                daysOverdue: c.aging,
                sleeUrgency: urgency
            });
            await db.update(cases).set({ priorityScore: score }).where(eq(cases.id, c.id));
        }

        // Recommend DCA
        const recommended = recommendDca(allDcas, {
            caseAmount: c.amount
        });

        if (recommended) {
            console.log(`Assigning Case ${c.id} ($${c.amount}) to ${recommended.name}`);
            await db.update(cases)
                .set({
                    assignedDcaId: recommended.id,
                    status: 'In Progress', // Update status
                    updatedAt: new Date()
                })
                .where(eq(cases.id, c.id));

            // Increment logic for DCA active cases would go here
            assignedCount++;
        }
    }

    console.log(`Automation Complete. Assigned ${assignedCount} cases.`);
}

runAutomation().catch(console.error);
