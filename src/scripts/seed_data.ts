
import { db } from '../lib/db';
import { dcas, cases, users, payments, auditLogs } from '../lib/db/schema';
import { sql } from 'drizzle-orm';

const DCAS_COUNT = 10;
const CASES_COUNT = 600;

const DCA_NAMES = [
    'Apex Financial Recovery', 'Summit Credit Solutions', 'Global Debt Recoveries',
    'Pinnacle Asset Management', 'Swift Collect', 'Eagle Eye Recovery',
    'Horizon Financial Services', 'Legacy Recovery Group', 'Zenith Collections', 'Prime Resolution'
];

async function seed() {
    console.log('Seeding database...');

    // 1. Create DCAs
    const dcaIds: string[] = [];
    console.log('Creating DCAs...');
    for (let i = 0; i < DCAS_COUNT; i++) {
        const id = `dca_${i + 1}`;
        const name = DCA_NAMES[i] || `DCA ${i + 1}`;
        try {
            await db.insert(dcas).values({
                id,
                name,
                email: `contact@${name.toLowerCase().replace(/\s+/g, '')}.com`,
                performanceScore: Math.floor(Math.random() * 40) + 60, // 60-100
                totalCases: 0,
                recoveredAmount: 0,
                activeCases: 0,
                manager: `Manager ${i + 1}`,
            }).onConflictDoNothing();
            dcaIds.push(id);
        } catch (e) {
            console.error(`Error creating DCA ${name}:`, e);
        }
    }

    // 2. Create Users
    console.log('Creating Users...');
    await db.insert(users).values([
        {
            id: 'user_admin',
            email: 'admin@swiftrecovery.com',
            displayName: 'Admin User',
            role: 'Admin',
        },
        {
            id: 'user_analyst',
            email: 'analyst@swiftrecovery.com',
            displayName: 'Analyst User',
            role: 'Analyst',
        }
    ]).onConflictDoNothing();

    // 3. Create Cases
    console.log('Creating Cases...');

    // Batch insert cases for performance? Drizzle supports valid batch inserts?
    // Let's do loop for simplicity and related records.

    for (let i = 0; i < CASES_COUNT; i++) {
        const amount = Math.floor(Math.random() * 10000) + 500;
        const aging = Math.floor(Math.random() * 180) + 30;
        const assignedDca = Math.random() > 0.3 ? dcaIds[Math.floor(Math.random() * dcaIds.length)] : null;
        const status = assignedDca ? (Math.random() > 0.7 ? 'Paid' : 'In Progress') : 'New';

        // Simple priority logic
        const priorityScore = Math.min(100, Math.floor((aging / 180) * 40 + (amount / 10000) * 40 + Math.random() * 20));

        // Recovery Prob
        const recoveryProbability = Math.max(0, Math.min(100, 100 - (aging / 2) + (priorityScore / 2)));

        const caseId = `case_${i + 1}`;

        await db.insert(cases).values({
            id: caseId,
            debtorName: `Customer ${i + 1}`,
            debtorAccountId: `ACC-${10000 + i}`,
            amount,
            aging,
            priorityScore,
            recoveryProbability,
            status,
            assignedDcaId: assignedDca,
            ownerId: 'user_admin',
            createdAt: new Date(Date.now() - Math.random() * 10000000000),
        });

        // 4. Payments
        if (status === 'Paid' || (status === 'In Progress' && Math.random() > 0.8)) {
            await db.insert(payments).values({
                id: `pay_${i}_1`,
                caseId,
                amount: status === 'Paid' ? amount : amount * 0.4,
                status: 'Completed',
                paymentDate: new Date()
            });

            // Update DCA stats if assigned
            if (assignedDca) {
                // We won't strictly update aggregates here to save complexity, 
                // but in a real app we'd trigger an update.
            }
        }

        // 5. Audit Log
        await db.insert(auditLogs).values({
            id: `audit_${i}_1`,
            caseId,
            userId: 'system',
            action: 'Case Created',
            timestamp: new Date()
        });
    }

    console.log('Seeding complete.');
}

seed().catch(console.error);
