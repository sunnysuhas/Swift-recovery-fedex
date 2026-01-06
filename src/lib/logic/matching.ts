
import { dcas } from '../db/schema';
import { InferSelectModel } from 'drizzle-orm';

type Dca = InferSelectModel<typeof dcas>;

export interface MatchingCriteria {
    caseAmount: number;
    caseType?: string; // 'CreditCard', 'Loan', etc.
}

/**
 * Recommends the best DCA for a given case based on Performance and Workload.
 */
export function recommendDca(availableDcas: Dca[], criteria: MatchingCriteria): Dca | null {
    if (availableDcas.length === 0) return null;

    // Sort by a composite score:
    // Score = Performance - (ActiveLoad * Penalty)

    // Calculate average workload to normalize
    const totalCases = availableDcas.reduce((sum, d) => sum + (d.activeCases || 0), 0);
    const avgLoad = totalCases / availableDcas.length || 1;

    const scoredDcas = availableDcas.map(dca => {
        const performance = dca.performanceScore || 50; // Default average
        const load = dca.activeCases || 0;

        // Load Factor: If load > avg, penalty increases
        const loadFactor = (load / avgLoad);

        // Simple formula: Performance (0-100) - LoadPenalty (0-20 approx)
        const matchScore = performance - (loadFactor * 10);

        return { dca, matchScore };
    });

    // Sort descending
    scoredDcas.sort((a, b) => b.matchScore - a.matchScore);

    return scoredDcas[0].dca;
}
