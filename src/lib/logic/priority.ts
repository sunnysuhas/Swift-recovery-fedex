
export interface PriorityFactors {
    recoveryProbability: number; // 0-100
    amount: number;
    daysOverdue: number;
    sleeUrgency: number; // 0-10 (10 = breaching soon)
}

/**
 * Calculates a priority score (0-100) based on weighted factors.
 */
export function calculatePriorityScore(factors: PriorityFactors): number {
    // Normalization baselines
    const MAX_AMOUNT = 50000; // Cap for normalization
    const MAX_DAYS = 365;

    // Weights
    const W_PROB = 0.4;
    const W_AMOUNT = 0.3;
    const W_DAYS = 0.2;
    const W_SLA = 0.1;

    // Normalize inputs to 0-1 range
    const normProb = factors.recoveryProbability / 100;
    const normAmount = Math.min(factors.amount / MAX_AMOUNT, 1);
    const normDays = Math.min(factors.daysOverdue / MAX_DAYS, 1);
    const normSla = factors.sleeUrgency / 10;

    const score = (
        (normProb * W_PROB) +
        (normAmount * W_AMOUNT) +
        (normDays * W_DAYS) +
        (normSla * W_SLA)
    ) * 100;

    return Math.round(score);
}
