
import { db } from '../lib/db';
import { cases, dcas, payments } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import { calculatePriorityScore } from '../lib/logic/priority';
import { recommendDca } from '../lib/logic/matching';

async function runE2ETest() {
    console.log('=== STARTING E2E VERIFICATION CHECK ===');

    // 1. SETUP: Ensure at least one DCA exists
    let dca = (await db.select().from(dcas).limit(1))[0];
    if (!dca) {
        console.log('[SETUP] Creating Test DCA...');
        dca = {
            id: 'test_dca_1',
            name: 'Test Recovery Services',
            email: 'test@example.com',
            performanceScore: 85,
            activeCases: 0,
            recoveredAmount: 0,
            totalCases: 0
        };
        await db.insert(dcas).values(dca).onConflictDoNothing();
    }
    console.log(`[CHECK] DCA Available: ${dca.name}`);

    // 2. TEST: Create a New Case (Simulate API/RPA)
    const testCaseId = `test_case_${Date.now()}`;
    console.log(`[TEST 1] Creating Case ${testCaseId}...`);
    await db.insert(cases).values({
        id: testCaseId,
        debtorName: 'John Doe Test',
        amount: 5000,
        aging: 45,
        status: 'New',
        createdAt: new Date(),
        updatedAt: new Date()
    });
    console.log('[PASS] Case Created in DB');

    // 3. TEST: ML Priority Scoring
    console.log('[TEST 2] Calculating Priority...');
    const priority = calculatePriorityScore({
        recoveryProbability: 60, // Mocked ML output
        amount: 5000,
        daysOverdue: 45,
        sleeUrgency: 0
    });
    console.log(`[INFO] Calculated Priority: ${priority}`);

    await db.update(cases).set({ priorityScore: priority }).where(eq(cases.id, testCaseId));

    if (priority > 0) console.log('[PASS] Priority Score Updated');
    else console.error('[FAIL] Priority Score Calculation failed');

    // 4. TEST: Auto-Assignment Logic
    console.log('[TEST 3] Running DCA Matching...');
    const match = recommendDca([dca], { caseAmount: 5000 });
    if (match && match.id === dca.id) {
        console.log(`[PASS] Recommended DCA: ${match.name}`);
        await db.update(cases).set({ assignedDcaId: match.id, status: 'In Progress' }).where(eq(cases.id, testCaseId));
    } else {
        console.error('[FAIL] DCA Matching returned null');
    }

    // 5. TEST: Payment Recording
    console.log('[TEST 4] Recording Payment...');
    const payId = `pay_${testCaseId}`;
    await db.insert(payments).values({
        id: payId,
        caseId: testCaseId,
        amount: 5000, // Full payment
        paymentDate: new Date(),
        status: 'Completed'
    });

    // Verify Payment exists
    const payCheck = await db.select().from(payments).where(eq(payments.id, payId));
    if (payCheck.length > 0) console.log('[PASS] Payment Recorded');
    else console.error('[FAIL] Payment not found');

    // 6. TEST: Cleanup
    console.log('[CLEANUP] Removing test data...');
    // await db.delete(cases).where(eq(cases.id, testCaseId));
    // await db.delete(payments).where(eq(payments.id, payId));
    // Keeping data for user inspection if needed.

    console.log('=== E2E VERIFICATION COMPLETE ===');
}

runE2ETest().catch(console.error);
